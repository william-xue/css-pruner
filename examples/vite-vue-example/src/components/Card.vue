<template>
  <div :class="cardClass">
    <div v-if="$slots.header" class="card-header">
      <slot name="header"></slot>
    </div>
    
    <div class="card-body">
      <slot></slot>
    </div>
    
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'Card',
  props: {
    variant: {
      type: String,
      default: 'default'
    },
    shadow: {
      type: String,
      default: 'normal',
      validator: (value) => {
        return ['none', 'small', 'normal', 'large'].includes(value)
      }
    }
  },
  setup(props) {
    const cardClass = computed(() => {
      const classes = ['card']
      
      if (props.variant !== 'default') {
        classes.push(`card-${props.variant}`)
      }
      
      if (props.shadow !== 'normal') {
        classes.push(`shadow-${props.shadow}`)
      }
      
      return classes.join(' ')
    })
    
    return {
      cardClass
    }
  }
}
</script>