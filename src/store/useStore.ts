import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { pinyin } from 'pinyin-pro';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from './useAuthStore';

export const PROJECT_LIMIT = 20;

export type GridType = 'tianzi' | 'mizi' | 'empty';
export type LayoutMode = 'char' | 'word';

export interface ProjectInfo {
  title: string;
  author: string;
  gridType: GridType;
  layoutMode: LayoutMode;
  cellSize: number; // in mm
  showStrokeOrder: boolean;
  hintCharsCount: number;
  showHintChars: boolean;
  showPinyin: boolean;
  showMeaning: boolean;
  practiceRowsPerWord: number;
  headerLeft: string;
  headerCenter: string;
  headerRight: string;
  headerSpacing: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  marginSymmetric: boolean;
  coverImage: string | null;
  introduction: string;
  headerFont: string;
  pageHeaderFont: string;
  introFont: string;
  introAlign: 'left' | 'center' | 'justify' | 'right';
}

export interface VocabItem {
  id: string;
  word: string;
  pinyin: string;
  meaning: string;
  chars: string[];
}

export interface Lesson {
  id: string;
  title: string;
  vocabulary: VocabItem[];
}

export interface SavedProject {
  id: string;
  name: string;
  lastModified: number;
  projectInfo: ProjectInfo;
  lessons: Lesson[];
}

interface AppState {
  projectInfo: ProjectInfo;
  lessons: Lesson[];
  activeLessonId: string | null;
  
  // Project Management
  savedProjects: SavedProject[];
  activeProjectId: string | null;
  
  // Actions
  updateProjectInfo: (info: Partial<ProjectInfo>) => void;
  addLesson: (title: string) => void;
  setActiveLesson: (id: string | null) => void;
  updateLessonTitle: (id: string, title: string) => void;
  
  importLessonBundle: (lessonTitle: string, vocabulary: any[]) => void;
  
  removeLesson: (id: string) => void;
  addVocab: (lessonId: string, word: string, meaning?: string) => void;
  updateVocab: (lessonId: string, vocabId: string, updates: Partial<VocabItem>) => void;
  removeVocab: (lessonId: string, vocabId: string) => void;
  bulkAddVocab: (lessonId: string, wordsText: string) => Promise<void>;

  // PM Actions
  saveCurrentProject: () => void;
  loadProject: (id: string) => void;
  createNewProject: (title?: string) => void;
  deleteProject: (id: string) => void;
  syncFromCloud: () => Promise<void>;
}

const defaultProjectInfo: ProjectInfo = {
  title: "Vở Tập Viết HSK 1",
  author: "Trung tâm Tiếng Trung",
  gridType: "tianzi",
  layoutMode: 'char',
  cellSize: 16,
  showStrokeOrder: true,
  hintCharsCount: 4,
  showHintChars: true,
  showPinyin: true,
  showMeaning: true,
  practiceRowsPerWord: 1,
  headerLeft: "Họ và tên: ....................",
  headerCenter: "Luyện viết chữ Hán",
  headerRight: "Ngày: ...../...../..........",
  headerSpacing: 10,
  marginTop: 15,
  marginRight: 15,
  marginBottom: 15,
  marginLeft: 15,
  marginSymmetric: true,
  coverImage: null,
  introduction: "",
  headerFont: "'Times New Roman', serif",
  pageHeaderFont: "'Times New Roman', serif",
  introFont: "'Times New Roman', serif",
  introAlign: "left",
};

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      projectInfo: defaultProjectInfo,
      lessons: [
        {
          id: 'les-1',
          title: 'Bài 1: Xin chào',
          vocabulary: []
        }
      ],
      activeLessonId: 'les-1',
      savedProjects: [],
      activeProjectId: 'proj-1', // Default active project

      updateProjectInfo: (info) => set((state) => {
        const next = { projectInfo: { ...state.projectInfo, ...info } };
        // auto-save logic can be called manually or we can trigger it in saveCurrentProject
        return next;
      }),

      addLesson: (title) => set((state) => {
        const newLesson = { id: `les-${generateId()}`, title, vocabulary: [] };
        return {
          lessons: [...state.lessons, newLesson],
          activeLessonId: newLesson.id
        };
      }),

      removeLesson: (id) => set((state) => {
        const newLessons = state.lessons.filter(l => l.id !== id);
        return {
          lessons: newLessons,
          activeLessonId: state.activeLessonId === id ? (newLessons[0]?.id || null) : state.activeLessonId
        };
      }),

      updateLessonTitle: (id, title) => set((state) => ({
        lessons: state.lessons.map(l => l.id === id ? { ...l, title } : l)
      })),
      
      importLessonBundle: (lessonTitle, vocabulary) => set((state) => {
        const newLessonId = `les-${generateId()}`;
        const importedVocab = vocabulary.map((v: any) => ({
          id: `voc-${generateId()}`,
          word: v.hanzi,
          pinyin: v.pinyin,
          meaning: v.meaning_vi,
          chars: Array.from(v.hanzi as string)
        }));
        
        return {
          lessons: [...state.lessons, { id: newLessonId, title: lessonTitle, vocabulary: importedVocab }],
          activeLessonId: newLessonId,
        };
      }),

      setActiveLesson: (id) => set({ activeLessonId: id }),

      addVocab: (lessonId, word, meaning = "") => set((state) => {
        const newVocab: VocabItem = {
          id: `voc-${generateId()}`,
          word,
          pinyin: pinyin(word),
          meaning,
          chars: Array.from(word)
        };
        return {
          lessons: state.lessons.map(l => 
            l.id === lessonId ? { ...l, vocabulary: [...l.vocabulary, newVocab] } : l
          )
        };
      }),

      updateVocab: (lessonId, vocabId, updates) => set((state) => ({
        lessons: state.lessons.map(l => {
          if (l.id !== lessonId) return l;
          return {
            ...l,
            vocabulary: l.vocabulary.map(v => 
              v.id === vocabId ? { ...v, ...updates } : v
            )
          };
        })
      })),

      removeVocab: (lessonId, vocabId) => set((state) => ({
        lessons: state.lessons.map(l => {
          if (l.id !== lessonId) return l;
          return { ...l, vocabulary: l.vocabulary.filter(v => v.id !== vocabId) };
        })
      })),

      bulkAddVocab: async (lessonId, wordsText) => {
        const words = wordsText.split(/[\s\n]+/).filter(w => w.trim().length > 0);
        if (words.length === 0) return;

        // First add them with empty meaning so UI updates immediately
        const newVocabs = words.map(word => ({
          id: `voc-${generateId()}`,
          word,
          pinyin: pinyin(word),
          meaning: "Đang dịch...",
          chars: Array.from(word)
        }));

        set((state) => ({
          lessons: state.lessons.map(l => 
            l.id === lessonId 
              ? { ...l, vocabulary: [...l.vocabulary, ...newVocabs] } 
              : l
          )
        }));

        // Fetch translations in parallel
        await Promise.all(newVocabs.map(async (vocab) => {
          try {
            const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-CN&tl=vi&dt=t&q=${encodeURIComponent(vocab.word)}`);
            const data = await res.json();
            const meaning = data[0]?.[0]?.[0] || "";
            
            // Update this specific vocab
            set((state) => ({
              lessons: state.lessons.map(l => {
                if (l.id !== lessonId) return l;
                return {
                  ...l,
                  vocabulary: l.vocabulary.map(v => 
                    v.id === vocab.id ? { ...v, meaning } : v
                  )
                };
              })
            }));
          } catch (err) {
            console.error("Translation error", err);
            set((state) => ({
              lessons: state.lessons.map(l => {
                if (l.id !== lessonId) return l;
                return {
                  ...l,
                  vocabulary: l.vocabulary.map(v => 
                    v.id === vocab.id ? { ...v, meaning: "" } : v
                  )
                };
              })
            }));
          }
        }));
      },

      saveCurrentProject: () => set((state) => {
        if (!state.activeProjectId) return state;
        
        const updatedSavedProjects = [...state.savedProjects];
        const existingIndex = updatedSavedProjects.findIndex(p => p.id === state.activeProjectId);
        
        const projectData: SavedProject = {
          id: state.activeProjectId,
          name: state.projectInfo.title || "Dự án không tên",
          lastModified: Date.now(),
          projectInfo: state.projectInfo,
          lessons: state.lessons,
        };

        if (existingIndex >= 0) {
          updatedSavedProjects[existingIndex] = projectData;
        } else {
          updatedSavedProjects.push(projectData);
        }

        const user = useAuthStore.getState().user;
        if (user) {
          supabase.from('projects').upsert({
            id: projectData.id,
            user_id: user.id,
            name: projectData.name,
            project_info: projectData.projectInfo,
            lessons: projectData.lessons,
            last_modified: new Date(projectData.lastModified).toISOString(),
          }).then(({ error }) => {
            if (error) console.error('[Supabase] Lỗi lưu dự án:', error.message);
          });
        }

        return { savedProjects: updatedSavedProjects };
      }),

      loadProject: (id: string) => set((state) => {
        if (state.activeProjectId) {
          get().saveCurrentProject();
        }
        // Need to fetch state again since get().saveCurrentProject() updated it
        const latestState = get();
        const proj = latestState.savedProjects.find(p => p.id === id);
        if (!proj) return state;
        return {
          activeProjectId: proj.id,
          projectInfo: proj.projectInfo,
          lessons: proj.lessons,
          activeLessonId: proj.lessons[0]?.id || null
        };
      }),

      createNewProject: (title?: string) => set((state) => {
        // Save current one first just in case
        if (state.activeProjectId) {
          get().saveCurrentProject();
        }

        const newId = `proj-${generateId()}`;
        return {
          activeProjectId: newId,
          projectInfo: {
            ...defaultProjectInfo,
            title: title || "Dự án không tên"
          },
          lessons: [{ id: 'les-1', title: 'Bài 1', vocabulary: [] }],
          activeLessonId: 'les-1',
        };
      }),

      deleteProject: (id: string) => set((state) => {
        const user = useAuthStore.getState().user;
        if (user) {
          supabase.from('projects').delete().eq('id', id).then(({ error }) => {
            if (error) console.error('[Supabase] Lỗi xoá dự án:', error.message);
          });
        }

        const newSaved = state.savedProjects.filter(p => p.id !== id);
        // If we deleted the active one, switch to another or create a new one
        if (state.activeProjectId === id) {
          if (newSaved.length > 0) {
            const nextProj = newSaved[0];
            return {
              savedProjects: newSaved,
              activeProjectId: nextProj.id,
              projectInfo: nextProj.projectInfo,
              lessons: nextProj.lessons,
              activeLessonId: nextProj.lessons[0]?.id || null
            };
          } else {
            return {
              savedProjects: newSaved,
              activeProjectId: `proj-${generateId()}`,
              projectInfo: defaultProjectInfo,
              lessons: [{ id: 'les-1', title: 'Bài 1: Xin chào', vocabulary: [] }],
              activeLessonId: 'les-1'
            };
          }
        }
        return { savedProjects: newSaved };
      }),

      syncFromCloud: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        const { data, error } = await supabase
          .from('projects')
          .select('id, name, project_info, lessons, last_modified')
          .eq('user_id', user.id);

        if (error) {
          console.error('[Supabase] Lỗi tải danh sách dự án:', error.message);
          return;
        }

        const cloudProjects: SavedProject[] = (data || []).map((row) => ({
          id: row.id,
          name: row.name,
          lastModified: new Date(row.last_modified).getTime(),
          projectInfo: row.project_info,
          lessons: row.lessons,
        }));

        const localOnly = get().savedProjects.filter(
          (p) => !cloudProjects.some((cp) => cp.id === p.id)
        );

        set({ savedProjects: [...cloudProjects, ...localOnly] });

        // Đẩy các vở tạo lúc chưa đăng nhập lên cloud, trong giới hạn còn lại
        const remaining = PROJECT_LIMIT - cloudProjects.length;
        for (const proj of localOnly.slice(0, Math.max(0, remaining))) {
          const { error: upsertError } = await supabase.from('projects').upsert({
            id: proj.id,
            user_id: user.id,
            name: proj.name,
            project_info: proj.projectInfo,
            lessons: proj.lessons,
            last_modified: new Date(proj.lastModified).toISOString(),
          });
          if (upsertError) console.error('[Supabase] Lỗi đồng bộ vở cũ:', upsertError.message);
        }
      },
    }),
    {
      name: 'hanzibuilder-storage', // key in localStorage
    }
  )
);
