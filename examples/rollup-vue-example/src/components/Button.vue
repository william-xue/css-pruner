<template>
  <button 
    :class="buttonClass"
    :disabled="disabled"
    @click="handleClick"
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
        return ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'].includes(value)
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
    },
    outline: {
      type: Boolean,
      default: false
    },
    rounded: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const buttonClass = computed(() => {
      const classes = ['btn']
      
      // Variant class
      if (props.outline) {
        classes.push(`btn-outline-${props.variant}`)
      } else {
        classes.push(`btn-${props.variant}`)
      }
      
      // Size class
      if (props.size !== 'normal') {
        classes.push(`btn-${props.size}`)
      }
      
      // Modifier classes
      if (props.block) {
        classes.push('btn-block')
      }
      
      if (props.rounded) {
        classes.push('btn-rounded')
      }
      
      if (props.disabled) {
        classes.push('btn-disabled')
      }
      
      return classes.join(' ')
    })
    
    const handleClick = (event) => {
      if (!props.disabled) {
        emit('click', event)
      }
    }
    
    return {
      buttonClass,
      handleClick
    }
  }
}
</script>