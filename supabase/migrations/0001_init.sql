-- Hồ sơ + phân quyền người dùng (role mặc định 'pending' khi vừa đăng ký)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  role text not null default 'pending' check (role in ('pending', 'approved', 'admin')),
  created_at timestamptz not null default now()
);
alter table profiles enable row level security;

create or replace function is_admin() returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$ language sql security definer stable;

create policy "user reads own profile" on profiles for select using (auth.uid() = id);
create policy "admin reads all profiles" on profiles for select using (is_admin());
-- Không có policy UPDATE cho client: đổi role chỉ được thực hiện qua api/admin/approve-user.ts
-- (dùng Supabase service role key trên server), tránh người dùng tự nâng quyền cho mình.

-- Vở tập viết của người dùng
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  project_info jsonb not null,
  lessons jsonb not null,
  last_modified timestamptz not null default now()
);
alter table projects enable row level security;
create policy "owner full access" on projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Giới hạn tối đa 20 vở/tài khoản, chặn cứng ở tầng DB (không lách được qua gọi API trực tiếp)
create or replace function check_project_limit() returns trigger as $$
begin
  if (select count(*) from projects where user_id = new.user_id) >= 20 then
    raise exception 'Đã đạt giới hạn 20 vở dự án. Xoá bớt vở cũ hoặc liên hệ Admin.';
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger enforce_project_limit
  before insert on projects
  for each row execute function check_project_limit();

-- Tự động tạo hồ sơ 'pending' mỗi khi có tài khoản mới đăng ký
create or replace function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Bucket lưu ảnh bìa vở (thay cho nhúng base64 trực tiếp vào dữ liệu dự án)
insert into storage.buckets (id, name, public, file_size_limit)
values ('covers', 'covers', true, 2097152) -- 2MB/ảnh
on conflict (id) do nothing;

create policy "anyone can view covers" on storage.objects
  for select using (bucket_id = 'covers');
create policy "owner uploads own covers" on storage.objects
  for insert with check (bucket_id = 'covers' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "owner deletes own covers" on storage.objects
  for delete using (bucket_id = 'covers' and auth.uid()::text = (storage.foldername(name))[1]);
