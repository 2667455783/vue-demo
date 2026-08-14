<template>
  <div class="page-card">
    <div class="toolbar">
      <span></span>
      <el-button v-if="permissionStore.hasPerm(PERM.ROLE_CREATE)" type="primary" @click="openDialog()">新增角色</el-button>
    </div>
    <el-table :data="tableData" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="角色名称" width="150" />
      <el-table-column prop="code" label="角色编码" width="150" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="menuIds" label="菜单权限" min-width="200">
        <template #default="{ row }">
          <el-tag v-for="mid in row.menuIds" :key="mid" size="small" style="margin: 2px">
            {{ getMenuName(mid) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button v-if="permissionStore.hasPerm(PERM.ROLE_UPDATE)" size="small" @click="openDialog(row)">编辑</el-button>
          <el-button v-if="permissionStore.hasPerm(PERM.ROLE_DELETE)" size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
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
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑角色' : '新增角色'" width="500px" @opened="onDialogOpened">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="form.code" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="菜单权限">
          <el-tree
            ref="menuTreeRef"
            :data="menuList"
            :props="{ label: 'name', children: 'children' }"
            show-checkbox
            check-strictly
            node-key="id"
            :default-checked-keys="form.menuIds"
          />
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
import { getRoleListApi, createRoleApi, updateRoleApi, deleteRoleApi } from '@/api/role'
import type { RoleItem } from '@/api/role'
import { getMenuListApi } from '@/api/menu'
import type { MenuItem } from '@/api/menu'
import { usePermissionStore } from '@/stores/permission'
import { PERM } from '@/constants/permission'

const permissionStore = usePermissionStore()

const tableData = ref<RoleItem[]>([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const menuList = ref<MenuItem[]>([])
const menuTreeRef = ref<InstanceType<typeof import('element-plus')['ElTree']>>()

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  id: 0,
  name: '',
  code: '',
  menuIds: [] as number[],
  status: 1,
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
}

// Flat menu name map
const menuNameMap = new Map<number, string>()
function buildMenuNameMap(menus: MenuItem[]) {
  for (const m of menus) {
    menuNameMap.set(m.id, m.name)
    if (m.children) buildMenuNameMap(m.children)
  }
}

function getMenuName(id: number): string {
  return menuNameMap.get(id) || String(id)
}

async function fetchList() {
  const res = await getRoleListApi({ page: page.value, pageSize: pageSize.value })
  tableData.value = res.list
  total.value = res.total
}

function openDialog(row?: RoleItem) {
  isEdit.value = !!row
  if (row) {
    form.id = row.id
    form.name = row.name
    form.code = row.code
    form.menuIds = [...row.menuIds]
    form.status = row.status
  } else {
    form.id = 0
    form.name = ''
    form.code = ''
    form.menuIds = []
    form.status = 1
  }
  dialogVisible.value = true
}

function onDialogOpened() {
  menuTreeRef.value?.setCheckedKeys(form.menuIds)
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  const checkedKeys = menuTreeRef.value?.getCheckedKeys() as number[] || []

  if (isEdit.value) {
    await updateRoleApi({ id: form.id, name: form.name, menuIds: checkedKeys, status: form.status })
    ElMessage.success('更新成功')
  } else {
    await createRoleApi({ name: form.name, code: form.code, menuIds: checkedKeys, status: form.status })
    ElMessage.success('创建成功')
  }
  dialogVisible.value = false
  fetchList()
  // 角色权限变更后刷新当前用户侧栏/按钮权限
  await permissionStore.fetchMenus()
}

async function handleDelete(id: number) {
  try {
    await ElMessageBox.confirm('确定删除该角色？', '提示', { type: 'warning' })
  } catch {
    return
  }
  await deleteRoleApi(id)
  ElMessage.success('删除成功')
  fetchList()
}

onMounted(async () => {
  fetchList()
  const menus = await getMenuListApi()
  menuList.value = menus
  buildMenuNameMap(menus)
})
</script>
