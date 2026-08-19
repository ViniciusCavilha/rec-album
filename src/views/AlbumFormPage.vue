<template>
  <ion-page
    ><ion-header
      ><ion-toolbar
        ><ion-buttons slot="start"
          ><ion-back-button default-href="/app/home" /></ion-buttons
        ><ion-title>Novo álbum</ion-title></ion-toolbar
      ></ion-header
    ><ion-content
      ><main class="page">
        <p class="page-kicker">Novo registro</p>
        <h1 class="page-title">O que entrou<br />em rotação?</h1>
        <p class="page-subtitle">
          Preencha a ficha do disco e monte a tracklist.
        </p>
        <form class="form" @submit.prevent="save">
          <ion-input
            v-model="name"
            label="Nome do álbum"
            label-placement="floating"
            fill="outline"
            required
          /><ion-input
            v-model="artist"
            label="Artista"
            label-placement="floating"
            fill="outline"
            required
          /><ion-input
            v-model.number="year"
            label="Ano de lançamento"
            label-placement="floating"
            type="number"
            fill="outline"
            min="1800"
            required
          />
          <h2 class="form-label">Tracklist</h2>
          <div v-for="(_, i) in songs" :key="i" class="row">
            <ion-input
              v-model="songs[i]"
              :label="'Faixa ' + String(i + 1).padStart(2, '0')"
              label-placement="floating"
              fill="outline"
              required
            /><ion-button
              v-if="songs.length > 1"
              fill="clear"
              color="danger"
              type="button"
              @click="songs.splice(i, 1)"
              ><ion-icon slot="icon-only" :icon="close"
            /></ion-button>
          </div>
          <ion-button fill="outline" type="button" @click="songs.push('')"
            ><ion-icon slot="start" :icon="add" />Adicionar faixa</ion-button
          ><ion-button expand="block" size="large" type="submit"
            >Guardar na coleção</ion-button
          >
        </form>
      </main></ion-content
    ></ion-page
  >
</template>
<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/vue";
import { add, close } from "ionicons/icons";
import { addAlbum } from "@/services/storage";
const r = useRouter(),
  name = ref(""),
  artist = ref(""),
  year = ref(new Date().getFullYear()),
  songs = ref([""]);
async function save() {
  await addAlbum({
    name: name.value.trim(),
    artist: artist.value.trim(),
    year: year.value,
    songs: songs.value.map((s) => s.trim()).filter(Boolean),
  });
  r.replace("/app/home");
}
</script>
