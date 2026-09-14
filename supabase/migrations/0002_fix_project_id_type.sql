-- Sửa lỗi: cột projects.id khai báo nhầm kiểu uuid trong khi id do client tự sinh
-- có dạng chuỗi (vd "proj-1", "proj-a1b2c3d"), không phải uuid.
alter table projects alter column id drop default;
alter table projects alter column id type text;
