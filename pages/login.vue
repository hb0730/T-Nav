<script setup lang="ts">
import type { AuthResponse, CreateUserDto, LoginDto } from '~/types/database'

definePageMeta({
  layout: false,
})
const router = useRouter()
const message = useMessage()

const loading = ref(false)
const isSetupMode = ref(false)

const formRef = ref()
const formData = ref<LoginDto & { email?: string, confirmPassword?: string }>({
  username: '',
  password: '',
  email: '',
  confirmPassword: '',
})

const rules = computed(() => ({
  username: {
    required: true,
    message: '请输入用户名',
    trigger: ['input', 'blur'],
  },
  password: {
    required: true,
    message: '请输入密码',
    trigger: ['input', 'blur'],
  },
  ...(isSetupMode.value && {
    confirmPassword: [
      {
        required: true,
        message: '请确认密码',
        trigger: ['input', 'blur'],
      },
      {
        validator: (_rule: any, value: string) => {
          return value === formData.value.password
        },
        message: '两次输入的密码不一致',
        trigger: ['input', 'blur'],
      },
    ],
  }),
}))

// 检查系统初始化状态
async function checkInitStatus() {
  try {
    const response = await $fetch<{ success: boolean, data: { needsSetup: boolean } }>('/api/auth/init-status')
    isSetupMode.value = response.data?.needsSetup || false
  }
  catch (error) {
    console.error('检查初始化状态失败:', error)
  }
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
    loading.value = true

    let response: AuthResponse

    if (isSetupMode.value) {
      // 注册第一个用户
      response = await $fetch<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: {
          username: formData.value.username,
          password: formData.value.password,
          email: formData.value.email,
        } as CreateUserDto,
      })
    }
    else {
      // 用户登录
      response = await $fetch<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: {
          username: formData.value.username,
          password: formData.value.password,
        } as LoginDto,
      })
    }

    if (response.success && response.data) {
      // 保存token到localStorage
      localStorage.setItem('auth_token', response.data.token)

      message.success(isSetupMode.value ? '账户创建成功！' : '登录成功！')

      // 跳转到管理端
      router.push('/admin')
    }
  }
  catch (error: any) {
    message.error(error.data?.message || '操作失败')
  }
  finally {
    loading.value = false
  }
}

function goHome() {
  router.push('/')
}

// 页面加载时检查初始化状态
onMounted(() => {
  checkInitStatus()
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="max-w-md w-full space-y-8 p-6">
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900 dark:text-gray-100">
          {{ isSetupMode ? '系统初始化' : '登录管理端' }}
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {{ isSetupMode ? '创建第一个管理员账户' : '使用您的账户登录' }}
        </p>
      </div>

      <n-card>
        <n-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-placement="top"
          @submit.prevent="handleSubmit"
        >
          <n-form-item label="用户名" path="username">
            <n-input
              v-model:value="formData.username"
              placeholder="请输入用户名"
              size="large"
            />
          </n-form-item>

          <n-form-item v-if="isSetupMode" label="邮箱" path="email">
            <n-input
              v-model:value="formData.email"
              placeholder="请输入邮箱（可选）"
              size="large"
            />
          </n-form-item>

          <n-form-item label="密码" path="password">
            <n-input
              v-model:value="formData.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              show-password-on="click"
            />
          </n-form-item>

          <n-form-item v-if="isSetupMode" label="确认密码" path="confirmPassword">
            <n-input
              v-model:value="formData.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              size="large"
              show-password-on="click"
            />
          </n-form-item>

          <div class="space-y-4">
            <n-button
              type="primary"
              size="large"
              :loading="loading"
              :disabled="loading"
              block
              @click="handleSubmit"
            >
              {{ isSetupMode ? '创建管理员账户' : '登录' }}
            </n-button>

            <div class="text-center">
              <n-button text @click="goHome">
                返回首页
              </n-button>
            </div>
          </div>
        </n-form>
      </n-card>

      <div class="text-center text-xs text-gray-500 dark:text-gray-400">
        <p>T-Nav 导航网站管理系统</p>
      </div>
    </div>
  </div>
</template>
