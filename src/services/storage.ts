import { computed, reactive } from 'vue'

export interface User { id: string; name: string; email: string; password: string }
export interface Album { id: string; userId: string; name: string; artist: string; year: number; songs: string[]; favorite: boolean; createdAt: string }

const USERS_KEY = 'rec-album:users'
const SESSION_KEY = 'rec-album:session'
const ALBUMS_KEY = 'rec-album:albums'
const read = <T>(key: string, fallback: T): T => { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback } catch { return fallback } }
const state = reactive({ users: read<User[]>(USERS_KEY, []), sessionId: localStorage.getItem(SESSION_KEY), albums: read<Album[]>(ALBUMS_KEY, []) })
const persistUsers = () => localStorage.setItem(USERS_KEY, JSON.stringify(state.users))
const persistAlbums = () => localStorage.setItem(ALBUMS_KEY, JSON.stringify(state.albums))

export const currentUser = computed(() => state.users.find((user) => user.id === state.sessionId) ?? null)
export const userAlbums = computed(() => state.albums.filter((album) => album.userId === state.sessionId))
export const isAuthenticated = () => Boolean(state.sessionId && currentUser.value)
export function register(name: string, email: string, password: string) { const normalizedEmail = email.trim().toLowerCase(); if (state.users.some((user) => user.email === normalizedEmail)) throw new Error('Este e-mail já está cadastrado.'); const user = { id: crypto.randomUUID(), name: name.trim(), email: normalizedEmail, password }; state.users.push(user); persistUsers(); login(normalizedEmail, password) }
export function login(email: string, password: string) { const user = state.users.find((item) => item.email === email.trim().toLowerCase() && item.password === password); if (!user) throw new Error('E-mail ou senha inválidos.'); state.sessionId = user.id; localStorage.setItem(SESSION_KEY, user.id) }
export function logout() { state.sessionId = null; localStorage.removeItem(SESSION_KEY) }
export function addAlbum(input: Pick<Album, 'name' | 'artist' | 'year' | 'songs'>) { if (!state.sessionId) throw new Error('Sessão expirada.'); state.albums.unshift({ ...input, id: crypto.randomUUID(), userId: state.sessionId, favorite: false, createdAt: new Date().toISOString() }); persistAlbums() }
export function getAlbum(id: string) { return state.albums.find((album) => album.id === id && album.userId === state.sessionId) }
export function toggleFavorite(id: string) { const album = getAlbum(id); if (album) { album.favorite = !album.favorite; persistAlbums() } }
export function removeAlbum(id: string) { const index = state.albums.findIndex((album) => album.id === id && album.userId === state.sessionId); if (index >= 0) { state.albums.splice(index, 1); persistAlbums() } }
