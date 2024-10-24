<template>
  <div :key="`key_${notes.length}`" :style="`translate: ${translateX}px ${translateY}px; scale: ${scale}; transform-origin: ${originX}px ${originY}px;`">
    <div
      ref="deskContainer"
      class="desk"
      @mousedown="startDrag"
    >

      <Note v-for="note in notes" :model-value="note" @update="update" @delete="deleteNote" :scale="scale"/>

    </div>
  </div>

  <div class="menu">
    <div class="menu-item" @click="createNote(color)" v-for="color in colors" :style="`background-color: ${color}`"></div>
  </div>

</template>
<script setup lang="ts">
import {ref, watch} from "vue";
import {useMouseInElement} from '@vueuse/core';

import Note from "@/components/note.vue";

const deskContainer = ref();
const { x, y, isOutside } = useMouseInElement(deskContainer);

const isDragging = ref(false);
const scale = ref(1);
const translateX = ref(0);
const translateY = ref(0);
const originX = ref(0);
const originY = ref(0);
const startX = ref(0);
const startY = ref(0);

const editModal = ref<INote | null>(null)
const notes = ref<Array<INote>>([])

const createNote = (color: string) => {
  notes.value=notes.value.concat([{
    id: Math.random() * (9000000 - 1000000) + 1000000,
    note: "",
    color: color,
    pinned: false,
    cords: { x: 100, y: 100 }
  }])
}

const update = (note : INote) => {
  notes.value = notes.value.map(n => n.id == note.id ? note : n)
}

async function deleteNote(note : INote) {
  if (confirm("are you sure?")) {
    notes.value = notes.value.filter(n => n.id != note.id)
  }
}

window.addEventListener("wheel", (event) => {
  if (isOutside.value || editModal.value) return;

  originX.value = x.value;
  originY.value = y.value;

  if (event.deltaY < 0) {
    if (scale.value >= 2) return;
    scale.value += 0.05;
  } else {
    if (scale.value <= 0.3) return;
    scale.value -= 0.05;
  }
});

const startDrag = (event: MouseEvent) => {
  if (event.target === deskContainer.value){
    isDragging.value = true;
    startX.value = event.clientX - translateX.value;
    startY.value = event.clientY - translateY.value;

    window.addEventListener("mousemove", onDrag);
    window.addEventListener("mouseup", stopDrag);
  }
};

const onDrag = (event: MouseEvent) => {
  if (!isDragging.value) return;
  translateX.value = event.clientX - startX.value;
  translateY.value = event.clientY - startY.value;
};

const stopDrag = () => {
  isDragging.value = false;
  window.removeEventListener("mousemove", onDrag);
  window.removeEventListener("mouseup", stopDrag);
};

notes.value = window.localStorage.getItem("notes")? JSON.parse(window.localStorage.getItem("notes")!) : [];
watch(()=>notes.value, (value)=>{
  window.localStorage.setItem("notes", JSON.stringify(value))
})

const colors = [
  '#FEB1B1',
  '#B1D0FE',
  '#FCFEB1',
]

interface INote {
  id: number;
  note: string;
  color: string;
  pinned: boolean;
  cords: { x: number; y: number };
}

</script>
