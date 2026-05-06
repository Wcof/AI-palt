<template>
  <a-modal v-model:open="visible" class="ai-login-modal" :footer="null" :width="460" centered destroyOnClose :maskClosable="false" :closable="true">
    <div class="login-dialog">
      <div class="header">
        <div class="shield">
          <SafetyCertificateOutlined />
        </div>
        <h3>极客光年 · 安全生产AI模型</h3>
        <p>智绘安全边界，引领安全生产新范式</p>
      </div>
      <a-form layout="vertical" @finish="handleSubmit">
        <a-form-item label="账号/邮箱">
          <a-input class="login-input" v-model:value="form.account" placeholder="请输入账号">
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>
        <a-form-item label="密码">
          <a-input-password class="login-input" v-model:value="form.password" placeholder="请输入密码">
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>
        <a-form-item label="验证码">
          <div class="captcha-row">
            <a-input class="login-input" v-model:value="form.code" placeholder="请输入验证码">
              <template #prefix>
                <SafetyOutlined />
              </template>
            </a-input>
            <div class="captcha-box" @click="handleChangeCheckCode">
              <img v-if="randCodeData.requestCodeSuccess && randCodeData.randCodeImage" :src="randCodeData.randCodeImage" alt="captcha" />
              <span v-else>X7K9</span>
            </div>
          </div>
        </a-form-item>
        <div class="remember-row">
          <a-checkbox v-model:checked="form.remember">记住账号</a-checkbox>
        </div>
        <a-button block type="primary" html-type="button" class="submit-btn" :loading="loginLoading" @click="handleSubmit">登 录</a-button>
      </a-form>
      <div class="status-hint">
        <span class="dot"></span>
        <span>极客光年 AI 团队研发</span>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
  import { computed, onMounted, reactive, ref, watch } from 'vue';
  import { UserOutlined, LockOutlined, SafetyOutlined, SafetyCertificateOutlined } from '@ant-design/icons-vue';
  import { message, notification } from 'ant-design-vue';

  const props = withDefaults(
    defineProps<{
      open?: boolean;
    }>(),
    {
      open: false,
    }
  );

  const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
    (e: 'success', payload: { account: string; remember: boolean; tenantId?: string }): void;
  }>();

  const visible = computed({
    get: () => props.open,
    set: (val: boolean) => emit('update:open', val),
  });

  const form = reactive({
    account: '',
    password: '',
    code: '',
    remember: true,
    tenantId: '',
  });

  const loginLoading = ref(false);
  const tenantList = ref<any[]>([]);
  const randCodeData = reactive<any>({
    randCodeImage: '',
    requestCodeSuccess: false,
    checkKey: null,
  });

  const showTenantSelect = computed(() => tenantList.value.length > 0);

  let tenantTimer: any = null;

  watch(
    () => form.code,
    () => {
      if (form.code && form.code.length === 4) {
        checkAccountAndGetTenants();
      }
    }
  );

  watch(
    () => props.open,
    (val) => {
      if (val) handleChangeCheckCode();
    }
  );

  function handleChangeCheckCode() {
    form.code = '';
    randCodeData.checkKey = new Date().getTime() + Math.random().toString(36).slice(-4);
    // 模拟获取验证码
    setTimeout(() => {
      randCodeData.randCodeImage = '';
      randCodeData.requestCodeSuccess = true;
    }, 300);
  }

  async function checkAccountAndGetTenants() {
    tenantTimer && clearTimeout(tenantTimer);
    tenantTimer = setTimeout(async () => {
      if (!form.account || !form.password || !form.code || form.code.length !== 4) {
        return;
      }
      if (tenantList.value && tenantList.value.length > 0) {
        return;
      }
      // 模拟获取租户列表
      setTimeout(() => {
        tenantList.value = [];
      }, 500);
    }, 500);
  }

  async function handleSubmit() {
    if (showTenantSelect.value && !form.tenantId) {
      message.warning('请选择租户');
      return;
    }
    if (!form.account) {
      message.warning('请输入账号');
      return;
    }
    if (!form.password) {
      message.warning('请输入密码');
      return;
    }
    if (!form.code) {
      message.warning('请输入验证码');
      return;
    }
    try {
      loginLoading.value = true;
      // 模拟登录
      setTimeout(() => {
        notification.success({
          message: '登录成功',
          description: `欢迎您：${form.account}`,
          duration: 3,
        });
        emit('success', {
          account: form.account,
          remember: form.remember,
          tenantId: form.tenantId,
        });
        visible.value = false;
        loginLoading.value = false;
      }, 1000);
    } catch (error: any) {
      notification.error({
        message: '登录失败',
        description: error?.message || '网络异常，请稍后重试',
        duration: 3,
      });
      handleChangeCheckCode();
      loginLoading.value = false;
    }
  }

  onMounted(() => {
    handleChangeCheckCode();
  });
</script>

<style scoped>
  .ai-login-modal :deep(.ant-modal-content) {
    border-radius: 20px;
    padding: 0;
    overflow: hidden;
    background: linear-gradient(180deg, #f8fcff 0%, #ffffff 50%, #f6fbff 100%);
    border: 1px solid #d9f0ff;
    box-shadow: 0 24px 60px rgba(0, 113, 191, 0.18);
  }

  .ai-login-modal :deep(.ant-modal-body) {
    padding: 0;
  }

  .login-dialog {
    padding: 30px 30px 26px;
  }

  .header {
    text-align: center;
    margin-bottom: 22px;
  }

  .shield {
    width: 60px;
    height: 60px;
    margin: 0 auto 16px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #eaf7ff;
    color: #045f8a;
    font-size: 30px;
  }

  .header h3 {
    margin: 0;
    font-size: 26px;
    line-height: 1.15;
    font-weight: 800;
    color: #1f2a37;
  }

  .header p {
    margin: 10px 0 0;
    font-size: 16px;
    font-weight: 600;
    color: #64748b;
  }

  .ai-login-modal :deep(.ant-form-item) {
    margin-bottom: 18px;
  }

  .ai-login-modal :deep(.ant-form-item-label > label) {
    color: #64748b;
    font-size: 12px;
    font-weight: 700;
  }

  .ai-login-modal :deep(.ant-input-affix-wrapper),
  .ai-login-modal :deep(.ant-input) {
    height: 48px;
    border-radius: 12px;
    border-color: #d0ebff;
  }

  .ai-login-modal :deep(.ant-input-affix-wrapper:hover),
  .ai-login-modal :deep(.ant-input-affix-wrapper-focused),
  .ai-login-modal :deep(.ant-input:hover),
  .ai-login-modal :deep(.ant-input:focus) {
    border-color: #8fd6ff;
    box-shadow: 0 0 0 2px rgba(0, 180, 254, 0.08);
  }

  .ai-login-modal :deep(.ant-input-prefix) {
    margin-right: 8px;
    color: #8aa6bc;
    font-size: 16px;
  }

  .captcha-row {
    display: flex;
    gap: 10px;
  }

  .login-input {
    height: 48px;
    border-color: #99cedf;
  }

  .captcha-box {
    width: 240px;
    border-radius: 12px;
    border: 1px solid #0d3a57;
    background: linear-gradient(135deg, #0f2940 0%, #153b57 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    letter-spacing: 2px;
    color: #f59e0b;
    font-size: 18px;
    user-select: none;
    cursor: pointer;
    overflow: hidden;
  }

  .captcha-box img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .remember-row {
    margin: 4px 0 18px;
  }

  .ai-login-modal :deep(.ant-checkbox-wrapper) {
    color: #64748b;
    font-size: 13px;
  }

  .submit-btn {
    height: 50px;
    font-size: 22px;
    font-weight: 800;
    letter-spacing: 2px;
    border-radius: 12px;
    background: linear-gradient(90deg, #1e90ff 0%, #4da1ff 50%, #7b61ff 100%);
    border: none;
    box-shadow: 0 12px 28px rgba(0, 179, 254, 0.35);
  }

  .submit-btn:hover {
    filter: brightness(1.05);
  }

  .status-hint {
    margin-top: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #94a3b8;
    font-size: 12px;
    font-weight: 700;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 8px rgba(34, 197, 94, 0.55);
  }
</style>