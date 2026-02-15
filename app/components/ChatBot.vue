<template>
  <div class="fixed bottom-6 right-6 z-50">
    <button @click="isOpen = !isOpen" class="bg-blue-600 text-white p-4 rounded-full shadow-xl hover:scale-110 transition">
      <MessageCircle v-if="!isOpen" />
      <X v-else />
    </button>

    <div v-if="isOpen" class="absolute bottom-20 right-0 w-80 h-96 bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden">
      <div class="bg-blue-600 p-4 text-white">
        <div class="flex items-center gap-3">
          <img :src="assistantAvatar" :alt="`Aurora, asistente virtual`" class="h-12 w-12 rounded-2xl border border-white/20 object-cover shadow-lg" />
          <div>
            <p class="text-xs uppercase tracking-[0.3em] text-white/70">Asistente virtual Aurora</p>
            <p class="text-lg font-bold">{{ assistantName }} · Pymeweb</p>
            <p class="text-[11px] text-white/80">Resuelvo dudas de precios y tiendas al instante.</p>
          </div>
        </div>
      </div>
      
      <div class="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        <div
          v-for="msg in messages"
          :key="msg.id"
          :class="['p-3 rounded-2xl text-sm max-w-[90%] shadow-sm whitespace-pre-line', msg.role === 'user' ? 'bg-blue-100 ml-auto text-slate-900' : 'bg-white text-slate-700']"
        >
          {{ msg.text }}
        </div>
        <div v-if="assistantBusy" class="w-40 rounded-2xl bg-white p-3 text-xs text-slate-500 shadow-sm">
          {{ busyLabel }}
        </div>
      </div>

      <div class="p-3 border-t bg-white">
        <div class="mb-2 flex gap-2 text-[11px] text-slate-500">
          <button class="rounded-full bg-slate-100 px-3 py-1 disabled:opacity-40" :disabled="assistantBusy" @click="quickAsk('¿Qué tienda tiene el precio más bajo?')">Más barato</button>
          <button class="rounded-full bg-slate-100 px-3 py-1 disabled:opacity-40" :disabled="assistantBusy" @click="quickAsk('Muéstrame computadores disponibles')">Computadores</button>
        </div>
        <div class="flex gap-2">
          <input
            v-model="userInput"
            @keyup.enter="handleSend"
            :disabled="assistantBusy"
            placeholder="Pregunta sobre productos..."
            class="flex-1 text-sm border border-slate-200 p-2 rounded-xl outline-none focus:border-blue-400 disabled:opacity-50"
          />
          <button
            @click="handleSend"
            class="rounded-xl bg-blue-600 px-3 text-white text-sm font-semibold disabled:opacity-50"
            :disabled="assistantBusy"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { MessageCircle, X } from 'lucide-vue-next'
import { useChat } from '~/composables/useChat'

type ChatMessage = { id: number; role: 'user' | 'bot'; text: string }

const assistantName = 'Aurora'
const assistantAvatar = 'https://api.dicebear.com/7.x/bottts/svg?seed=Aurora&backgroundColor=1c76ff,0b1a3f&backgroundType=gradientLinear'
const { sendMessage } = useChat()
const isOpen = ref(false)
const userInput = ref('')
const messages = ref<ChatMessage[]>([
  { id: 1, role: 'bot', text: `¡Hola! Soy ${assistantName}, tu asistente virtual Aurora. Puedo recomendarte tiendas, comparar precios o contarte qué conviene comprar hoy.` },
])
const isThinking = ref(false)
const isTyping = ref(false)
const typingTimers = new Set<number>()

const assistantBusy = computed(() => isThinking.value || isTyping.value)
const busyLabel = computed(() =>
  isThinking.value ? `${assistantName} está revisando los catálogos...` : `${assistantName} está escribiendo su respuesta`
)

const stopTypingTimers = () => {
  typingTimers.forEach((timer) => window.clearTimeout(timer))
  typingTimers.clear()
}

onBeforeUnmount(() => {
  stopTypingTimers()
})

// Typing optimizado: muestra "escribiendo" y luego el mensaje completo, sin letras sueltas
const typeBotResponse = (text: string) =>
  new Promise<void>((resolve) => {
    isTyping.value = true
    const botMessage: ChatMessage = { id: Date.now() + Math.floor(Math.random() * 1000), role: 'bot', text: '' }
    messages.value.push(botMessage)
    // Simula "escribiendo" según la longitud del mensaje, pero nunca más de 1.5s
    const minDelay = 400
    const maxDelay = 1500
    const delay = Math.min(maxDelay, Math.max(minDelay, text.length * 18))
    const timer = window.setTimeout(() => {
      botMessage.text = text
      isTyping.value = false
      typingTimers.delete(timer)
      resolve()
    }, delay)
    typingTimers.add(timer)
  })

const quickAsk = (text: string) => {
  if (assistantBusy.value) return
  userInput.value = text
  handleSend()
}

const handleSend = async () => {
  const question = userInput.value.trim()
  if (!question || assistantBusy.value) return
  messages.value.push({ id: Date.now(), role: 'user', text: question })
  userInput.value = ''
  isThinking.value = true
  try {
    const response = await sendMessage(question)
    isThinking.value = false
    await typeBotResponse(response.answer)
  } catch (error) {
    isThinking.value = false
    await typeBotResponse('No pude responder ahora, intenta de nuevo en un momento.')
  }
}
</script>
