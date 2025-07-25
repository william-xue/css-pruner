<template>
  <div class="app">
    <header class="header">
      <h1 class="title">CSS Pruner Demo - Vite + Vue</h1>
      <p class="subtitle">This example demonstrates CSS pruning with intentionally redundant styles</p>
    </header>
    
    <main class="main-content">
      <Card class="counter-card">
        <template #header>
          <h2 class="card-title">Counter Example</h2>
        </template>
        
        <p class="counter-display">Count: {{ count }}</p>
        <div class="button-group">
          <Button @click="increment" variant="primary">
            Increment
          </Button>
          <Button @click="decrement" variant="secondary">
            Decrement
          </Button>
          <Button @click="reset" variant="danger">
            Reset
          </Button>
        </div>
      </Card>
      
      <Card>
        <template #header>
          <h2 class="card-title">Todo List</h2>
        </template>
        
        <div class="todo-input">
          <input 
            v-model="newTodo" 
            @keyup.enter="addTodo"
            class="form-control"
            placeholder="Add a new todo..."
          >
          <Button @click="addTodo" variant="primary">Add</Button>
        </div>
        
        <ul class="todo-list" v-if="todos.length">
          <li v-for="todo in todos" :key="todo.id" class="todo-item">
            <span :class="{ 'todo-completed': todo.completed }">{{ todo.text }}</span>
            <div class="todo-actions">
              <Button 
                @click="toggleTodo(todo.id)" 
                :variant="todo.completed ? 'secondary' : 'success'"
                size="small"
              >
                {{ todo.completed ? 'Undo' : 'Done' }}
              </Button>
              <Button @click="removeTodo(todo.id)" variant="danger" size="small">
                Remove
              </Button>
            </div>
          </li>
        </ul>
        
        <p v-else class="empty-state">No todos yet. Add one above!</p>
      </Card>
      
      <Card>
        <template #header>
          <h2 class="card-title">Information</h2>
        </template>
        
        <p class="info-text">
          This project includes many unused CSS classes that should be detected by the CSS Pruner.
          Check the style.css file to see all the defined styles, and run the CSS analysis to see which ones are unused.
        </p>
        
        <div class="stats">
          <div class="stat-item">
            <span class="stat-label">Total Todos:</span>
            <span class="stat-value">{{ todos.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Completed:</span>
            <span class="stat-value">{{ completedCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Remaining:</span>
            <span class="stat-value">{{ remainingCount }}</span>
          </div>
        </div>
      </Card>
    </main>
    
    <footer class="footer">
      <p class="footer-text">Built with Vite + Vue 3</p>
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
    const count = ref(0)
    const newTodo = ref('')
    const todos = ref([])
    const nextId = ref(1)
    
    const completedCount = computed(() => 
      todos.value.filter(todo => todo.completed).length
    )
    
    const remainingCount = computed(() => 
      todos.value.filter(todo => !todo.completed).length
    )
    
    const increment = () => {
      count.value++
    }
    
    const decrement = () => {
      count.value--
    }
    
    const reset = () => {
      count.value = 0
    }
    
    const addTodo = () => {
      if (newTodo.value.trim()) {
        todos.value.push({
          id: nextId.value++,
          text: newTodo.value.trim(),
          completed: false
        })
        newTodo.value = ''
      }
    }
    
    const toggleTodo = (id) => {
      const todo = todos.value.find(t => t.id === id)
      if (todo) {
        todo.completed = !todo.completed
      }
    }
    
    const removeTodo = (id) => {
      const index = todos.value.findIndex(t => t.id === id)
      if (index > -1) {
        todos.value.splice(index, 1)
      }
    }
    
    return {
      count,
      newTodo,
      todos,
      completedCount,
      remainingCount,
      increment,
      decrement,
      reset,
      addTodo,
      toggleTodo,
      removeTodo
    }
  }
}
</script>