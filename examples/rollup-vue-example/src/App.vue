<template>
  <div class="app">
    <header class="header">
      <h1 class="title">CSS Pruner Demo - Rollup + Vue</h1>
      <p class="subtitle">This example demonstrates CSS pruning with intentionally redundant styles</p>
    </header>
    
    <main class="main-content">
      <Card class="feature-card">
        <template #header>
          <h2 class="card-title">Interactive Dashboard</h2>
        </template>
        
        <div class="dashboard">
          <div class="metric-card">
            <h3 class="metric-title">Page Views</h3>
            <p class="metric-value">{{ pageViews.toLocaleString() }}</p>
            <Button @click="incrementViews" variant="primary" size="small">
              +100
            </Button>
          </div>
          
          <div class="metric-card">
            <h3 class="metric-title">Users Online</h3>
            <p class="metric-value">{{ usersOnline }}</p>
            <div class="user-controls">
              <Button @click="addUser" variant="success" size="small">
                +1
              </Button>
              <Button @click="removeUser" variant="danger" size="small">
                -1
              </Button>
            </div>
          </div>
          
          <div class="metric-card">
            <h3 class="metric-title">Revenue</h3>
            <p class="metric-value">${{ revenue.toFixed(2) }}</p>
            <Button @click="addRevenue" variant="success" size="small">
              +$10
            </Button>
          </div>
        </div>
      </Card>
      
      <Card>
        <template #header>
          <h2 class="card-title">Task Manager</h2>
        </template>
        
        <div class="task-input">
          <input 
            v-model="newTask" 
            @keyup.enter="addTask"
            class="form-input"
            placeholder="Add a new task..."
          >
          <select v-model="newTaskPriority" class="form-select">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <Button @click="addTask" variant="primary">Add Task</Button>
        </div>
        
        <div class="task-filters">
          <Button 
            v-for="filter in filters" 
            :key="filter"
            @click="currentFilter = filter"
            :variant="currentFilter === filter ? 'primary' : 'secondary'"
            size="small"
          >
            {{ filter.charAt(0).toUpperCase() + filter.slice(1) }}
          </Button>
        </div>
        
        <ul class="task-list" v-if="filteredTasks.length">
          <li 
            v-for="task in filteredTasks" 
            :key="task.id" 
            :class="['task-item', `priority-${task.priority}`, { 'task-completed': task.completed }]"
          >
            <div class="task-content">
              <span class="task-text">{{ task.text }}</span>
              <span :class="['priority-badge', `priority-${task.priority}`]">
                {{ task.priority }}
              </span>
            </div>
            <div class="task-actions">
              <Button 
                @click="toggleTask(task.id)" 
                :variant="task.completed ? 'secondary' : 'success'"
                size="small"
              >
                {{ task.completed ? 'Undo' : 'Done' }}
              </Button>
              <Button @click="removeTask(task.id)" variant="danger" size="small">
                Delete
              </Button>
            </div>
          </li>
        </ul>
        
        <p v-else class="empty-state">No tasks found. Add one above!</p>
      </Card>
      
      <Card>
        <template #header>
          <h2 class="card-title">Project Information</h2>
        </template>
        
        <p class="info-text">
          This Rollup + Vue example includes extensive unused CSS classes to demonstrate the effectiveness 
          of the CSS Pruner tool. The build process uses Rollup to bundle the application and extract CSS.
        </p>
        
        <div class="project-stats">
          <div class="stat-grid">
            <div class="stat-item">
              <span class="stat-label">Total Tasks:</span>
              <span class="stat-value">{{ tasks.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Completed:</span>
              <span class="stat-value">{{ completedTasks }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">High Priority:</span>
              <span class="stat-value">{{ highPriorityTasks }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Page Views:</span>
              <span class="stat-value">{{ pageViews.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </Card>
    </main>
    
    <footer class="footer">
      <p class="footer-text">Built with Rollup + Vue 3 • CSS Pruner Demo</p>
    </footer>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import Button from './components/Button.vue'
import Card from './components/Card.vue'

export default {
  name: 'App',
  components: {
    Button,
    Card
  },
  setup() {
    // Dashboard state
    const pageViews = ref(12543)
    const usersOnline = ref(42)
    const revenue = ref(1250.75)
    
    // Task management state
    const newTask = ref('')
    const newTaskPriority = ref('medium')
    const tasks = ref([])
    const nextTaskId = ref(1)
    const currentFilter = ref('all')
    const filters = ['all', 'active', 'completed', 'high', 'medium', 'low']
    
    // Computed properties
    const completedTasks = computed(() => 
      tasks.value.filter(task => task.completed).length
    )
    
    const highPriorityTasks = computed(() => 
      tasks.value.filter(task => task.priority === 'high').length
    )
    
    const filteredTasks = computed(() => {
      let filtered = tasks.value
      
      switch (currentFilter.value) {
        case 'active':
          filtered = tasks.value.filter(task => !task.completed)
          break
        case 'completed':
          filtered = tasks.value.filter(task => task.completed)
          break
        case 'high':
        case 'medium':
        case 'low':
          filtered = tasks.value.filter(task => task.priority === currentFilter.value)
          break
        default:
          filtered = tasks.value
      }
      
      return filtered
    })
    
    // Dashboard methods
    const incrementViews = () => {
      pageViews.value += 100
    }
    
    const addUser = () => {
      usersOnline.value++
    }
    
    const removeUser = () => {
      if (usersOnline.value > 0) {
        usersOnline.value--
      }
    }
    
    const addRevenue = () => {
      revenue.value += 10
    }
    
    // Task methods
    const addTask = () => {
      if (newTask.value.trim()) {
        tasks.value.push({
          id: nextTaskId.value++,
          text: newTask.value.trim(),
          priority: newTaskPriority.value,
          completed: false,
          createdAt: new Date()
        })
        newTask.value = ''
      }
    }
    
    const toggleTask = (id) => {
      const task = tasks.value.find(t => t.id === id)
      if (task) {
        task.completed = !task.completed
      }
    }
    
    const removeTask = (id) => {
      const index = tasks.value.findIndex(t => t.id === id)
      if (index > -1) {
        tasks.value.splice(index, 1)
      }
    }
    
    return {
      // Dashboard
      pageViews,
      usersOnline,
      revenue,
      incrementViews,
      addUser,
      removeUser,
      addRevenue,
      
      // Tasks
      newTask,
      newTaskPriority,
      tasks,
      currentFilter,
      filters,
      filteredTasks,
      completedTasks,
      highPriorityTasks,
      addTask,
      toggleTask,
      removeTask
    }
  }
}
</script>