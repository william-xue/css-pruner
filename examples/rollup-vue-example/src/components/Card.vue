<template>
  <div :class="cardClass">
    <header v-if="$slots.header" class="card-header">
      <slot name="header"></slot>
    </header>
    
    <div class="card-body">
      <slot></slot>
    </div>
    
    <footer v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </footer>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'Card',
  props: {
    variant: {
      type: String,
      default: 'default',
      validator: (value) => {
        return ['default', 'primary', 'secondary', 'success', 'danger', 'warning', 'info'].includes(value)
      }
    },
    shadow: {
      type: String,
      default: 'normal',
      validator: (value) => {
        return ['none', 'small', 'normal', 'large'].includes(value)
      }
    },
    bordered: {
      type: Boolean,
      default: true
    },
    rounded: {
      type: Boolean,
      default: true
    },
    hoverable: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const cardClass = computed(() => {
      const classes = ['card']
      
      // Variant class
      if (props.variant !== 'default') {
        classes.push(`card-${props.variant}`)
      }
      
      // Shadow class
      if (props.shadow !== 'none') {
        classes.push(`card-shadow-${props.shadow}`)
      }
      
      // Modifier classes
      if (!props.bordered) {
        classes.push('card-no-border')
      }
      
      if (props.rounded) {
        classes.push('card-rounded')
      }
      
      if (props.hoverable) {
        classes.push('card-hoverable')
      }
      
      return classes.join(' ')
    })
    
    return {
      cardClass
    }
  }
}
</script>