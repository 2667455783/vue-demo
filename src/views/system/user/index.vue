<template>
  <div class="page-card">
    <div class="search-bar">
      <el-input v-model="searchUsername" placeholder="用户名" clearable style="width: 200px" />
      <el-button type="primary" @click="fetchList">搜索</el-button>
      <el-button @click="searchUsername = ''; fetchList()">重置</el-button>
    </div>
    <div class="toolbar">
      <span></span>
      <el-button v-if="permissionStore.hasPerm(PERM.USER_CREATE)" type="primary" @click="openDialog()">新增用户</el-button>
    </div>
    <el-table :data="tableData" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="nickname" label="昵称" width="120" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="roleIds" label="角色" min-width="150">
        <template #default="{ row }">
          <el-tag v-for="rid in row.roleIds" :key="rid" style="margin-right: 4px">
            {{ getRoleName(rid) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button v-if="permissionStore.hasPerm(PERM.USER_UPDATE)" size="small" @click="openDialog(row as UserItem)">编辑</el-button>
          <el-button v-if="permissionStore.hasPerm(PERM.USER_DELETE)" size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-wrap">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @change="fetchList"
      />
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑用户' : '新增用户'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" :disabled="isEdit" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" />
        </el-form-item>
        <el-form-item label="角色" prop="roleIds">
          <el-select v-model="form.roleIds" multiple placeholder="请选择角色" style="width: 100%">
            <el-option v-for="role in allRoles" :key="role.id" :label="role.name" :value="role.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getUserListApi, createUserApi, updateUserApi, deleteUserApi } from '@/api/user'
import { getAllRolesApi } from '@/api/role'
import type { UserItem } from '@/api/user'
import type { RoleItem } from '@/api/role'
import { usePermissionStore } from '@/stores/permission'
import { PERM } from '@/constants/permission'

const permissionStore = usePermissionStore()

const searchUsername = ref('')
const tableData = ref<UserItem[]>([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const allRoles = ref<RoleItem[]>([])

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  id: 0,
  username: '',
  password: '',
  nickname: '',
  roleIds: [] as number[],
  status: 1,
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
}

function getRoleName(roleId: number): string {
  return allRoles.value.find((r) => r.id === roleId)?.name || String(roleId)
}

async function fetchList() {
  const res = await getUserListApi({ page: page.value, pageSize: pageSize.value, username: searchUsername.value })
  tableData.value = res.list
  total.value = res.total
}

function openDialog(row?: UserItem) {
  isEdit.value = !!row
  if (row) {
    form.id = row.id
    form.username = row.username
    form.password = ''
    form.nickname = row.nickname
    form.roleIds = [...row.roleIds]
    form.status = row.status
  } else {
    form.id = 0
    form.username = ''
    form.password = ''
    form.nickname = ''
    form.roleIds = []
    form.status = 1
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  if (isEdit.value) {
    await updateUserApi({ id: form.id, nickname: form.nickname, roleIds: form.roleIds, status: form.status })
    ElMessage.success('更新成功')
  } else {
    await createUserApi({ username: form.username, password: form.password, nickname: form.nickname, roleIds: form.roleIds, status: form.status })
    ElMessage.success('创建成功')
  }
  dialogVisible.value = false
  fetchList()
}

async function handleDelete(id: number) {
  try {
    await ElMessageBox.confirm('确定删除该用户？', '提示', { type: 'warning' })
  } catch {
    return
  }
  await deleteUserApi(id)
  ElMessage.success('删除成功')
  fetchList()
}

onMounted(() => {
  fetchList()
  getAllRolesApi().then((res) => { allRoles.value = res })
})
</script>
