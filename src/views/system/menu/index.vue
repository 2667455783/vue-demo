<template>
  <div class="page-card">
    <div class="toolbar">
      <span></span>
      <el-button v-if="permissionStore.hasPerm(PERM.MENU_CREATE)" type="primary" @click="openDialog()">新增菜单</el-button>
    </div>
    <el-table :data="menuTree" border row-key="id" :tree-props="{ children: 'children' }" default-expand-all>
      <el-table-column prop="name" label="菜单名称" min-width="150" />
      <el-table-column prop="icon" label="图标" width="80">
        <template #default="{ row }">
          <el-icon v-if="row.icon"><component :is="row.icon" /></el-icon>
        </template>
      </el-table-column>
      <el-table-column prop="type" label="类型" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.type === 'directory'" type="warning">目录</el-tag>
          <el-tag v-else-if="row.type === 'menu'" type="success">菜单</el-tag>
          <el-tag v-else type="info">按钮</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="path" label="路径" min-width="150" />
      <el-table-column prop="component" label="组件" min-width="120" />
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button v-if="permissionStore.hasPerm(PERM.MENU_UPDATE)" size="small" @click="openDialog(row)">编辑</el-button>
          <el-button v-if="permissionStore.hasPerm(PERM.MENU_DELETE)" size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑菜单' : '新增菜单'" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="上级菜单">
          <el-tree-select
            v-model="form.parentId"
            :data="menuTreeSelect"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            check-strictly
            placeholder="顶级菜单"
            clearable
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio value="directory">目录</el-radio>
            <el-radio value="menu">菜单</el-radio>
            <el-radio value="button">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item v-if="form.type !== 'button'" label="路径" prop="path">
          <el-input v-model="form.path" />
        </el-form-item>
        <el-form-item v-if="form.type !== 'button'" label="组件">
          <el-input v-model="form.component" />
        </el-form-item>
        <el-form-item v-if="form.type !== 'button'" label="图标">
          <IconSelect v-model="form.icon" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" />
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
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getMenuListApi, createMenuApi, updateMenuApi, deleteMenuApi } from '@/api/menu'
import type { MenuItem } from '@/api/menu'
import { usePermissionStore } from '@/stores/permission'
import { PERM } from '@/constants/permission'
import IconSelect from '@/components/IconSelect/index.vue'

const permissionStore = usePermissionStore()

const menuTree = ref<MenuItem[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  id: 0,
  parentId: 0,
  name: '',
  path: '',
  component: '',
  icon: '',
  type: 'menu' as 'directory' | 'menu' | 'button',
  sort: 0,
  status: 1,
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择菜单类型', trigger: 'change' }],
}

const menuTreeSelect = computed(() => {
  const root: MenuItem = { id: 0, parentId: 0, name: '顶级菜单', path: '', component: '', icon: '', type: 'directory', sort: 0, status: 1, children: menuTree.value }
  return [root]
})

async function fetchList() {
  menuTree.value = await getMenuListApi()
}

function openDialog(row?: MenuItem) {
  isEdit.value = !!row
  if (row) {
    form.id = row.id
    form.parentId = row.parentId
    form.name = row.name
    form.path = row.path
    form.component = row.component
    form.icon = row.icon
    form.type = row.type
    form.sort = row.sort
    form.status = row.status
  } else {
    form.id = 0
    form.parentId = 0
    form.name = ''
    form.path = ''
    form.component = ''
    form.icon = ''
    form.type = 'menu'
    form.sort = 0
    form.status = 1
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  if (isEdit.value) {
    await updateMenuApi({ ...form })
    ElMessage.success('更新成功')
  } else {
    await createMenuApi({ ...form })
    ElMessage.success('创建成功')
  }
  dialogVisible.value = false
  fetchList()
  // 刷新侧栏菜单
  permissionStore.fetchMenus()
}

async function handleDelete(id: number) {
  try {
    await ElMessageBox.confirm('确定删除该菜单及其子菜单？', '提示', { type: 'warning' })
  } catch {
    return
  }
  await deleteMenuApi(id)
  ElMessage.success('删除成功')
  fetchList()
  permissionStore.fetchMenus()
}

onMounted(() => {
  fetchList()
})
</script>
