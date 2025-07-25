<template>
  <button 
    :class="buttonClass"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot></slot>
  </button>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'Button',
  emits: ['click'],
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => {
        return ['primary', 'secondary', 'success', 'danger', 'warning', 'info'].includes(value)
      }
    },
    size: {
      type: String,
      default: 'normal',
      validator: (value) => {
        return ['small', 'normal', 'large'].includes(value)
      }
    },
    disabled: {
      type: Boolean,
      default: false
    },
    block: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const buttonClass = computed(() => {
      const classes = ['btn', `btn-${props.variant}`]
      
      if (props.size !== 'normal') {
        classes.push(`btn-${props.size}`)
      }
      
      if (props.block) {
        classes.push('btn-block')
      }
      
      if (props.disabled) {
        classes.push('btn-disabled')
      }
      
      return classes.join(' ')
    })
    
    return {
      buttonClass
    }
  }
}
</script>