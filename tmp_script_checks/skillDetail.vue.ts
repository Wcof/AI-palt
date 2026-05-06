declare function defineOptions(arg:any):any;
declare function defineProps<T>():T;
declare function defineEmits<T>():any;

import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AlertTriangle, ArrowLeft, CheckCircle2, FileText, Lightbulb, ShieldCheck, Sparkles } from 'lucide-vue-next'
import { useSkillCenterStore } from '@/stores/skillCenter'

defineOptions({ name: 'SkillDetail' })
const route = useRoute()
const router = useRouter()
const store = useSkillCenterStore()
const detail = computed(() => store.skillItems.find(item => item.id === String(route.params.id)) || store.skillItems[0])

function lines(text: string) { return text.split(/\n+/).map(v => v.trim()).filter(Boolean) }
function escapeHtml(text: string) { return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }
function renderMarkdown(text: string) { return escapeHtml(text).replace(/^# (.*)$/gm, '<h1 class="mb-3 text-2xl font-bold text-slate-950">$1</h1>').replace(/^## (.*)$/gm, '<h2 class="mb-2 mt-5 text-base font-semibold text-slate-900">$1</h2>').replace(/^- (.*)$/gm, '<li class="ml-5 list-disc text-sm leading-7 text-slate-700">$1</li>').replace(/\n/g, '<br />') }
