<template>
  <ion-page
    ><ion-header
      ><ion-toolbar><ion-title>Favoritos</ion-title></ion-toolbar></ion-header
    ><ion-content
      ><main class="page">
        <p class="page-kicker">Seleção especial</p>
        <h1 class="page-title">Os que nunca saem de cena.</h1>
        <p class="page-subtitle">
          Sua prateleira essencial, sem faixas de preenchimento.
        </p>
        <div v-if="favorites.length" class="grid">
          <AlbumCard v-for="a in favorites" :key="a.id" :album="a" />
        </div>
        <div v-else class="empty">
          <div class="empty-icon"><ion-icon :icon="heartOutline" /></div>
          <h2>Ainda sem favoritos</h2>
          <p>Toque no coração de um álbum para trazê-lo para cá.</p>
        </div>
      </main></ion-content
    ></ion-page
  >
</template>
<script setup lang="ts">
import { computed } from "vue";
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/vue";
import { heartOutline } from "ionicons/icons";
import AlbumCard from "@/components/AlbumCard.vue";
import { userAlbums } from "@/services/storage";
const favorites = computed(() => userAlbums.value.filter((a) => a.favorite));
</script>
