<template>
  <div
    class="note"
    @mousedown="startDrag"
    v-on-click-outside="()=>menuState=false"
    @contextmenu.prevent="()=>menuState=true"
    :style="`top: ${position.y}px; left: ${position.x}px; background-color: ${model?.color}; ${model?.pinned? '' : 'cursor: move;'}`"
  >
    <div v-if="model?.pinned" class="note-pinned"></div>

    <div v-if="menuState" class="note-menu">
      <img alt="" v-if="model.pinned" @click="model.pinned = false" src="@/assets/svg/unpin.svg">
      <img alt="" v-else @click="model.pinned = true" src="@/assets/svg/pin.svg">

      <img alt="" @click="emit('delete', model)" src="@/assets/svg/trash.svg">
    </div>

    <textarea v-model="model.note" maxlength="364" @input="(e: any)=>{
        const lines = e.target.value.split('\n');
        if (lines.length > 13) model.note = lines.slice(0, 13).join('\n');
    }" />

  </div>
</template>
<script setup lang="ts">
import {vOnClickOutside} from '@vueuse/components';
import {ref, watch} from 'vue';

const emit=defineEmits(['update', 'delete'])
const props = defineProps({
  scale: {
    type: Number,
    default: 1,
  }
})

const model = defineModel<INote>({
  default: {
    id: 0,
    note: '',
    color: '',
    pinned: false,
    cords: { x: 0, y: 0 },
  }
})

const menuState = ref(false)

const dragging = ref(false);
const position = ref(model.value.cords || { x: 0, y: 0 });
const offset = ref({ x: 0, y: 0 });

watch(()=>model.value, ()=>{
  emit('update', model.value)
}, { deep: true })

const startDrag = (event: any) => {
  if (model.value.pinned) return

  dragging.value = true;
  offset.value = {
    x: event.clientX - (position.value.x * props.scale),
    y: event.clientY - (position.value.y * props.scale),
  };
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
};

const onDrag = (event: any) => {
  if (dragging.value) {
    position.value = {
      x: (event.clientX - offset.value.x) / props.scale,
      y: (event.clientY - offset.value.y) / props.scale,
    };
    model.value.cords = position.value
  }
};

const stopDrag = () => {
  dragging.value = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
};

interface INote {
  id: number;
  note: string;
  color: string;
  pinned: boolean;
  cords: { x: number; y: number };
}


</script>
