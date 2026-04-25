<template>
  <div class="role-manage">
    <div class="page-header">
      <h2>角色管理</h2>
      <el-button type="primary" :icon="Plus" @click="openCreateDialog">新建角色</el-button>
    </div>

    <el-table :data="roles" stripe style="width: 100%">
      <el-table-column prop="name" label="角色名" width="140">
        <template #default="{ row }">
          <el-tag :type="row.name === 'admin' ? 'danger' : ''" effect="plain">{{ row.name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" />
      <el-table-column label="权限" width="300">
        <template #default="{ row }">
          <el-tag
            v-for="skill in row.skills"
            :key="skill"
            size="small"
            effect="plain"
            round
            style="margin: 2px"
          >
            {{ skillNameMap[skill] || skill }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="userCount" label="用户数" width="100" />
      <el-table-column label="操作" width="160">
        <template #default="{ row }">
          <el-button text type="primary" size="small" @click="openEditDialog(row)">编辑</el-button>
          <el-button v-if="row.name !== 'admin'" text type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 创建/编辑角色对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑角色' : '新建角色'" width="480px">
      <el-form label-width="80px">
        <el-form-item label="角色名">
          <el-input v-model="form.name" placeholder="如：pro用户" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" placeholder="角色描述" />
        </el-form-item>
        <el-form-item label="权限">
          <div class="skill-checkboxes">
            <el-checkbox
              v-for="skill in ALL_SKILLS"
              :key="skill.key"
              v-model="skillChecked[skill.key]"
              :label="skill.name"
              border
              style="margin: 4px 8px 4px 0"
            />
          </div>
          <div style="margin-top: 8px">
            <el-button text size="small" @click="selectAll">全选</el-button>
            <el-button text size="small" @click="selectNone">清空</el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { Role } from '@/types'
import { getRoleList, createRole, updateRole, deleteRole, ALL_SKILLS } from '@/api/admin'

const skillNameMap: Record<string, string> = {}
ALL_SKILLS.forEach(s => { skillNameMap[s.key] = s.name })

const roles = ref<Role[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editingRoleId = ref<number | null>(null)
const saving = ref(false)
const form = reactive({ name: '', description: '' })
const skillChecked = reactive<Record<string, boolean>>({})

onMounted(async () => {
  const res = await getRoleList()
  roles.value = (res as any).data ?? res
})

const resetSkillChecked = (skills: string[] = []) => {
  ALL_SKILLS.forEach(s => { skillChecked[s.key] = skills.includes(s.key) })
}

const openCreateDialog = () => {
  isEdit.value = false
  form.name = ''
  form.description = ''
  resetSkillChecked([])
  dialogVisible.value = true
}

const openEditDialog = (role: Role) => {
  isEdit.value = true
  editingRoleId.value = role.id
  form.name = role.name
  form.description = role.description
  resetSkillChecked(role.skills)
  dialogVisible.value = true
}

const selectAll = () => {
  ALL_SKILLS.forEach(s => { skillChecked[s.key] = true })
}

const selectNone = () => {
  ALL_SKILLS.forEach(s => { skillChecked[s.key] = false })
}

const handleSave = async () => {
  if (!form.name.trim()) {
    ElMessage.warning('请输入角色名')
    return
  }
  saving.value = true
  try {
    const skills = ALL_SKILLS.filter(s => skillChecked[s.key]).map(s => s.key)
    if (isEdit.value && editingRoleId.value !== null) {
      await updateRole(editingRoleId.value, { name: form.name, description: form.description, skills })
    } else {
      await createRole({ name: form.name, description: form.description, skills })
    }
    ElMessage.success(isEdit.value ? '角色已更新' : '角色已创建')
    dialogVisible.value = false
    const res = await getRoleList()
    roles.value = (res as any).data ?? res
  } finally {
    saving.value = false
  }
}

const handleDelete = async (role: Role) => {
  try {
    await ElMessageBox.confirm(`确定删除角色「${role.name}」？当前 ${role.userCount} 个用户使用此角色。`, '删除角色', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }
  await deleteRole(role.id)
  roles.value = roles.value.filter(r => r.id !== role.id)
  ElMessage.success('已删除')
}
</script>

<style scoped>
.role-manage {
  padding: 24px;
  height: 100vh;
  overflow-y: auto;
  background: #f5f7fa;
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

.skill-checkboxes {
  display: flex;
  flex-wrap: wrap;
}
</style>
