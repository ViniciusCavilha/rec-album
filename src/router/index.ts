import { createRouter, createWebHistory } from "@ionic/vue-router";
import type { RouteRecordRaw } from "vue-router";
import { initializeStorage, isAuthenticated } from "@/services/storage";
const routes: RouteRecordRaw[] = [
  { path: "/", redirect: "/app/home" },
  {
    path: "/login",
    component: () => import("@/views/LoginPage.vue"),
    meta: { guest: true },
  },
  {
    path: "/cadastro",
    component: () => import("@/views/RegisterPage.vue"),
    meta: { guest: true },
  },
  {
    path: "/app",
    component: () => import("@/views/TabsPage.vue"),
    meta: { requiresAuth: true },
    children: [
      { path: "", redirect: "/app/home" },
      { path: "home", component: () => import("@/views/HomePage.vue") },
      {
        path: "favoritos",
        component: () => import("@/views/FavoritesPage.vue"),
      },
      { path: "sobre", component: () => import("@/views/AboutPage.vue") },
    ],
  },
  {
    path: "/app/novo-album",
    component: () => import("@/views/AlbumFormPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/app/album/:id",
    component: () => import("@/views/AlbumDetailPage.vue"),
    meta: { requiresAuth: true },
  },
];
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
router.beforeEach(async (to) => {
  await initializeStorage();
  if (to.matched.some((r) => r.meta.requiresAuth) && !isAuthenticated())
    return "/login";
  if (to.meta.guest && isAuthenticated()) return "/app/home";
});
export default router;
