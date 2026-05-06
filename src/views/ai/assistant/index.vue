<template>
  <div class="wrap">
    <div class="content">
      <div class="h-full min-h-0 rounded-2xl border border-sky-200/70 bg-white/70 shadow-[inset_0_0_0_1px_rgba(0,180,255,0.08)]">
        <div class="relative flex h-full min-h-0 overflow-hidden">
          <div class="flex-1">
            <ChatInterface
              :conversation="conversation"
              :messages="messages"
              :streaming="streaming"
              :thinking-mode="thinkingMode"
              :show-thinking-toggle="true"
              :show-file-upload="true"
              :question-required="true"
              :agent-id="agentId"
              :conversation-id="conversationId"
              :agents="AI_AGENT_OPTIONS"
              :selected-agent="selectedAgent"
              :agent-focused="agentFocused"
              :error="error"
              :show-welcome-screen="true"
              :show-sidebar-toggle="false"
              @send="handleSend"
              @send-image="handleSendImage"
              @select-prompt="handlePrompt"
              @toggle-thinking="(v) => thinkingMode = v"
              @change-agent="handleChangeAgent"
              @clear-agent="handleClearAgent"
              @retry="handleRetry"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import ChatInterface from '@/components/aiApp/ChatInterface.vue';
  import { AI_AGENT_OPTIONS, type AgentType } from '@/stores/aiApp';
  import { message } from 'ant-design-vue';
  
  defineOptions({ name: 'AiAssistantIndex' });
  
  const agentId = 'rag';
  const selectedAgent = ref<AgentType>('rag');
  const agentFocused = ref(true);
  const params = ref([
    {
      name: 'session_id',
      type: 'string',
      defaultValue: null,
      required: true,
      description: '会话 ID。',
    },
    {
      name: 'question',
      type: 'string',
      defaultValue: null,
      required: true,
      description: '当前用户问题。',
    },
    {
      name: 'enable_thinking',
      type: 'bool',
      defaultValue: 'true',
      required: false,
      description: '是否启用最终总结阶段的 thinking 输出。',
    },
  ]);
  
  const router = useRouter();
  const streaming = ref(false);
  const thinkingMode = ref(false);
  const error = ref<string | null>(null);
  const conversationId = ref('temp-1');
  const conversation = ref({
    id: 'temp-1',
    title: '新会话',
    agent_id: agentId,
    agentType: selectedAgent.value,
    created_at: Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [] as any[],
  });
  
  const messages = ref([
    {
      id: 'msg-1',
      conversation_id: 'temp-1',
      inputs: {},
      query: '你好，我想了解安全生产的基本要求',
      message_files: [],
      answer: '安全生产是企业运营的重要组成部分，主要包括以下基本要求：\n\n1. 建立健全安全生产管理制度\n2. 加强员工安全培训和教育\n3. 配备必要的安全防护设施\n4. 定期进行安全检查和隐患排查\n5. 制定应急预案并定期演练\n6. 遵守国家相关法律法规\n7. 建立安全生产责任制度\n8. 加强安全文化建设\n\n这些要求有助于预防事故发生，保障员工生命财产安全，促进企业可持续发展。',
      referenceText: '',
      dataText: '',
      thinking: '',
      targetTitle: '',
      thinkingAutoCloseAt: undefined,
      isError: false,
      thinkingBlocks: [],
      created_at: Date.now() - 3600000,
      feedback: null,
      retriever_resources: [],
    },
  ]);
  
  function generateId(prefix: string) {
    return prefix + Date.now() + Math.random().toString(36).substr(2, 9);
  }
  
  function resolveQuestion(content: string, files: File[]) {
    const text = String(content || '').trim();
    if (text) return text;
    if (Array.isArray(files) && files.length > 0) {
      return '请帮我识别图中隐患';
    }
    return '';
  }
  
  async function handleSend(content: string) {
    const files: File[] = [];
    const questionText = resolveQuestion(content, files);
    
    if (!questionText) {
      message.warning('问题内容为必填！');
      return;
    }
    
    const newMessage = {
      id: generateId('msg-'),
      conversation_id: conversationId.value,
      inputs: {},
      query: questionText,
      message_files: [],
      answer: '',
      referenceText: '',
      dataText: '',
      thinking: '',
      targetTitle: '',
      thinkingAutoCloseAt: undefined,
      isError: false,
      thinkingBlocks: [],
      created_at: Date.now(),
      feedback: null,
      retriever_resources: [],
    };
    
    messages.value.push(newMessage);
    const messageIndex = messages.value.length - 1;
    streaming.value = true;
    error.value = null;
    
    try {
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟流式响应
      const answers = [
        '安全生产是企业的重要责任，',
        '需要从多个方面进行管理。',
        '首先，要建立完善的安全管理制度，',
        '其次，要加强员工的安全培训，',
        '最后，要定期进行安全检查和隐患排查。',
      ];
      
      for (const part of answers) {
        await new Promise(resolve => setTimeout(resolve, 300));
        messages.value[messageIndex].answer += part;
      }
      
      if (thinkingMode.value) {
        messages.value[messageIndex].thinking = '我需要从多个维度分析安全生产的要求，包括制度建设、培训教育、设施配备等方面，确保全面覆盖企业的安全管理需求。';
        messages.value[messageIndex].thinkingAutoCloseAt = Date.now();
      }
    } catch (e: any) {
      error.value = e.message || '发送失败';
      messages.value[messageIndex].isError = true;
      messages.value[messageIndex].answer = '网络错误，请稍后重试！';
    } finally {
      streaming.value = false;
    }
  }
  
  function handlePrompt(content: string) {
    handleSend(content);
  }
  
  function handleSendImage(image: string) {
    if (!image) return;
    handleSend('请帮我识别图中隐患');
  }

  function handleChangeAgent(agentType: AgentType) {
    selectedAgent.value = agentType;
    agentFocused.value = true;
    conversation.value.agentType = agentType;
  }

  function handleClearAgent() {
    agentFocused.value = false;
    selectedAgent.value = 'general';
    conversation.value.agentType = 'general';
  }

  function handleRetry() {
    // 重试逻辑
  }
  
  function goToAbilities() {
    router.push('/abilities');
  }
</script>

<style scoped lang="css">
  .wrap {
    height: 100%;
    width: 100%;
    border-radius: 16px;
    overflow: hidden;
  }
  
  .content {
    background: #fff;
    width: 100%;
    height: 100%;
  }
</style>
