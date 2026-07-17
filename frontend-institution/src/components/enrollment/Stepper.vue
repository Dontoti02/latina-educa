<template>
  <div class="stepper">
    <div
    @click="clickButton(index)"
    style="cursor: pointer"
      v-for="(step, index) in steps"
      :key="index"
      :class="['step', { active: index <= currentStep && index <= transitionStep }]"
    >
      <div
        class="circle"
        :style="{
          backgroundColor: (index <= currentStep && index <= transitionStep ? activeColor : backgroundColor),
          border: '8px solid '+backgroundColor,
            transition: (index === transitionStep ? 'transform 0.5s ease' : 'none'),
            transform: (index === transitionStep ? 'scale(1.2)' : 'scale(1)'),
        }"
      ></div>
      <span class="label">{{ step }}</span>
    </div>
    <div class="line"
    :style="{
  backgroundColor: backgroundColor,
  width: (100-(100/stepsLength))+'%',
  left: ((100/stepsLength)/2)+'%',
  right:((100/stepsLength)/2)+'%'
    }"></div>
    <div class="line active" :style="{
  backgroundColor: activeColor,
  width: ((100/stepsLength)*currentStep)+'%',
  left: ((100/stepsLength)/2)+'%',
  right:((100/stepsLength)/2)+'%',
  transition: 'width 0.5s ease'
    }" @transitionend="onTransitionEnd"></div>
  </div>
</template>

<script>
export default {
  emits: ['clickButton'],
  props:{
    steps: {
      type: Array,
      required: true,
    },
    backgroundColor:{
      type: String,
      default: '#25293C',
    },
    activeColor:{
      type: String,
      default: '#D9D9D9',
    },
    currentStep: {
      type: Number,
      default: 0,
    },
    inactiveText:{
      type: String,
      default: '#999999',
    }
  },
  data() {
    return {
      transitionStep: this.currentStep
    };
  },
  computed: {
    stepsLength() {
      // this.transitionStep = this.currentStep;
      return this.steps.length;
    }
  },
  watch: {
    currentStep() {
      this.transitionStep = this.currentStep - 1;
    }
  },
  methods: {
    onTransitionEnd() {
      this.transitionStep = this.currentStep;
    },
    clickButton(index){
      this.$emit('clickButton', index);
    }
  }
};
</script>
<style scoped>
.stepper {
  display: flex;
  align-items: center;
  position: relative;
  padding: 20px;
  border-radius: 8px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
}

.circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  z-index: 2; 
}

.step.active .circle {
  background-color: white;
  z-index: 2; 
}

.label {
  margin-top: 8px;
  font-size: 12px;
  text-align: center;
}

.line {
  position: absolute;
  pointer-events: none;
  top: 32%;
  height: 20px;
  background-color: #25293C; 
  z-index: 1; 
}
.line.active {
  position: absolute;
  top: 37%;
  height: 7px;
  background-color: #ffffff; 
   z-index: 2; 
}
</style>
