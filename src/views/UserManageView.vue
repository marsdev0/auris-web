<template>
  <div class="user-manage">
    <div class="page-header">
      <h2>用户管理</h2>
      <el-input
        v-model="search"
        placeholder="搜索用户名"
        style="width: 220px"
        clearable
        :prefix-icon="Search"
      />
    </div>

    <el-table :data="filteredUsers" stripe>
      <el-table-column prop="username" label="用户名" width="140" />
      <el-table-column prop="nickname" label="昵称" width="140" />
      <el-table-column label="角色" width="160">
        <template #default="{ row }">
          <el-tag :type="row.roleName === 'admin' ? 'danger' : row.roleName === 'pro用户' ? '' : 'info'" effect="plain" size="small">
            {{ row.roleName }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 0 ? 'success' : 'danger'" size="small">
            {{ row.status === 0 ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="注册时间" width="140" />
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button text type="primary" size="small" @click="openRoleDialog(row)">编辑角色</el-button>
          <el-button
            v-if="row.roleName !== 'admin'"
            :text="true"
            :type="row.status === 0 ? 'danger' : 'success'"
            size="small"
            @click="toggleStatus(row)"
          >
            {{ row.status === 0 ? '禁用' : '启用' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="page"
      :page-size="pageSize"
      :total="total"
      layout="total, prev, pager, next"
      style="margin-top: 16px; justify-content: flex-end"
      @current-change="handlePageChange"
    />

    <!-- 编辑角色对话框 -->
    <el-dialog v-model="roleDialogVisible" title="编辑角色" width="400px">
      <div class="dialog-user">{{ editingUser?.nickname }}（{{ editingUser?.username }}）</div>
      <el-select v-model="selectedRole" placeholder="选择角色" style="width: 100%; margin-top: 12px">
        <el-option v-for="role in roles" :key="role.id" :label="role.name" :value="role.name">
          <span>{{ role.name }}</span>
          <span style="float: right; color: #909399; font-size: 12px">{{ role.description }}</span>
        </el-option>
      </el-select>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveRole">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import type { AdminUser, Role } from '@/types'
import { getUserList, getRoleList, updateUserRole, updateUserStatus } from '@/api/admin'

const users = ref<AdminUser[]>([])
const roles = ref<Role[]>([])
const search = ref('')
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const roleDialogVisible = ref(false)
const editingUser = ref<AdminUser | null>(null)
const selectedRole = ref('')
const saving = ref(false)

const filteredUsers = computed(() => {
  if (!search.value) return users.value
  return users.value.filter(u => u.username.includes(search.value) || u.nickname.includes(search.value))
})

const fetchUsers = async () => {
  const res = await getUserList(page.value, pageSize.value)
  users.value = res.data.list
  total.value = res.data.total
}

onMounted(async () => {
  const [, roleRes] = await Promise.all([fetchUsers(), getRoleList()])
  roles.value = roleRes.data
})

const handlePageChange = (newPage: number) => {
  page.value = newPage
  fetchUsers()
}

const openRoleDialog = (user: AdminUser) => {
  editingUser.value = user
  selectedRole.value = user.roleName
  roleDialogVisible.value = true
}

const saveRole = async () => {
  if (!editingUser.value) return
  saving.value = true
  try {
    await updateUserRole(editingUser.value.id, selectedRole.value)
    editingUser.value.roleName = selectedRole.value
    ElMessage.success('角色已更新')
    roleDialogVisible.value = false
  } finally {
    saving.value = false
  }
}

const toggleStatus = async (user: AdminUser) => {
  const newStatus = user.status === 0 ? 1 : 0
  await updateUserStatus(user.id, newStatus)
  user.status = newStatus
  ElMessage.success(newStatus === 0 ? '已启用' : '已禁用')
}
</script>

<style scoped>
.user-manage {
  padding: 24px;
  height: 100vh;
  overflow-y: auto;
  background: #f5f7fa;
  box-sizing: border-box;
}

.user-manage :deep(.el-table) {
  width: 100%;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.dialog-user {
  font-size: 14px;
  color: #606266;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}
</style>
