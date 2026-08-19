import { Capacitor } from '@capacitor/core'
import {
  CapacitorSQLite,
  SQLiteConnection,
  type SQLiteDBConnection,
} from '@capacitor-community/sqlite'
import { computed, reactive } from 'vue'

export interface User {
  id: string
  name: string
  email: string
  password: string
}

export interface Album {
  id: string
  userId: string
  name: string
  artist: string
  year: number
  songs: string[]
  favorite: boolean
  createdAt: string
}

const DATABASE_NAME = 'rec_album'
const LEGACY_USERS_KEY = 'rec-album:users'
const LEGACY_SESSION_KEY = 'rec-album:session'
const LEGACY_ALBUMS_KEY = 'rec-album:albums'
const sqlite = new SQLiteConnection(CapacitorSQLite)
const isWeb = Capacitor.getPlatform() === 'web'

const state = reactive<{
  users: User[]
  sessionId: string | null
  albums: Album[]
}>({
  users: [],
  sessionId: null,
  albums: [],
})

let database: SQLiteDBConnection | null = null
let initialization: Promise<void> | null = null

export const currentUser = computed(
  () => state.users.find((user) => user.id === state.sessionId) ?? null,
)

export const userAlbums = computed(() =>
  state.albums.filter((album) => album.userId === state.sessionId),
)

export const isAuthenticated = () =>
  Boolean(state.sessionId && currentUser.value)

function readLegacyData<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

async function persistDatabase() {
  if (isWeb) await sqlite.saveToStore(DATABASE_NAME)
}

async function openDatabase() {
  try {
    database = await sqlite.createConnection(
      DATABASE_NAME,
      false,
      'no-encryption',
      1,
      false,
    )
  } catch {
    database = await sqlite.retrieveConnection(DATABASE_NAME, false)
  }

  await database.open()
  await database.execute(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS albums (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      artist TEXT NOT NULL,
      release_year INTEGER NOT NULL,
      favorite INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      album_id TEXT NOT NULL,
      title TEXT NOT NULL,
      position INTEGER NOT NULL,
      FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS app_session (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      user_id TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `)

  await migrateLegacyData()
  await persistDatabase()
  await loadData()
}

async function migrateLegacyData() {
  if (!database) return

  const result = await database.query('SELECT COUNT(*) AS total FROM users')
  const databaseAlreadyHasData = Number(result.values?.[0]?.total ?? 0) > 0

  if (databaseAlreadyHasData) {
    clearLegacyData()
    return
  }

  const users = readLegacyData<User[]>(LEGACY_USERS_KEY, [])
  const albums = readLegacyData<Album[]>(LEGACY_ALBUMS_KEY, [])
  const sessionId = localStorage.getItem(LEGACY_SESSION_KEY)

  for (const user of users) {
    await database.run(
      'INSERT OR IGNORE INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
      [user.id, user.name, user.email, user.password],
    )
  }

  for (const album of albums) {
    if (!users.some((user) => user.id === album.userId)) continue

    await database.run(
      `INSERT OR IGNORE INTO albums
       (id, user_id, name, artist, release_year, favorite, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        album.id,
        album.userId,
        album.name,
        album.artist,
        album.year,
        album.favorite ? 1 : 0,
        album.createdAt,
      ],
    )

    for (const [position, title] of album.songs.entries()) {
      await database.run(
        'INSERT INTO songs (album_id, title, position) VALUES (?, ?, ?)',
        [album.id, title, position],
      )
    }
  }

  if (sessionId && users.some((user) => user.id === sessionId)) {
    await database.run(
      'INSERT OR REPLACE INTO app_session (id, user_id) VALUES (1, ?)',
      [sessionId],
    )
  }

  clearLegacyData()
}

function clearLegacyData() {
  localStorage.removeItem(LEGACY_USERS_KEY)
  localStorage.removeItem(LEGACY_ALBUMS_KEY)
  localStorage.removeItem(LEGACY_SESSION_KEY)
}

async function loadData() {
  if (!database) return

  const [usersResult, albumsResult, songsResult, sessionResult] =
    await Promise.all([
      database.query('SELECT id, name, email, password FROM users'),
      database.query(`
        SELECT id, user_id, name, artist, release_year, favorite, created_at
        FROM albums
        ORDER BY created_at DESC
      `),
      database.query(
        'SELECT album_id, title, position FROM songs ORDER BY position',
      ),
      database.query('SELECT user_id FROM app_session WHERE id = 1'),
    ])

  state.users = (usersResult.values ?? []).map((row) => ({
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    password: String(row.password),
  }))

  state.albums = (albumsResult.values ?? []).map((row) => ({
    id: String(row.id),
    userId: String(row.user_id),
    name: String(row.name),
    artist: String(row.artist),
    year: Number(row.release_year),
    favorite: Boolean(row.favorite),
    createdAt: String(row.created_at),
    songs: (songsResult.values ?? [])
      .filter((song) => song.album_id === row.id)
      .map((song) => String(song.title)),
  }))

  state.sessionId = sessionResult.values?.[0]?.user_id
    ? String(sessionResult.values[0].user_id)
    : null
}

export function initializeStorage() {
  initialization ??= openDatabase()
  return initialization
}

export async function register(
  name: string,
  email: string,
  password: string,
) {
  await initializeStorage()
  const normalizedEmail = email.trim().toLowerCase()

  if (state.users.some((user) => user.email === normalizedEmail)) {
    throw new Error('Este e-mail já está cadastrado.')
  }

  const user: User = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    password,
  }

  await database!.run(
    'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
    [user.id, user.name, user.email, user.password],
  )

  state.users.push(user)
  await login(normalizedEmail, password)
}

export async function login(email: string, password: string) {
  await initializeStorage()
  const user = state.users.find(
    (item) =>
      item.email === email.trim().toLowerCase() && item.password === password,
  )

  if (!user) throw new Error('E-mail ou senha inválidos.')

  await database!.run(
    'INSERT OR REPLACE INTO app_session (id, user_id) VALUES (1, ?)',
    [user.id],
  )

  state.sessionId = user.id
  await persistDatabase()
}

export async function logout() {
  await initializeStorage()
  await database!.run('DELETE FROM app_session WHERE id = 1')
  state.sessionId = null
  await persistDatabase()
}

export async function addAlbum(
  input: Pick<Album, 'name' | 'artist' | 'year' | 'songs'>,
) {
  await initializeStorage()
  if (!state.sessionId) throw new Error('Sessão expirada.')

  const album: Album = {
    ...input,
    id: crypto.randomUUID(),
    userId: state.sessionId,
    favorite: false,
    createdAt: new Date().toISOString(),
  }

  await database!.run(
    `INSERT INTO albums
     (id, user_id, name, artist, release_year, favorite, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      album.id,
      album.userId,
      album.name,
      album.artist,
      album.year,
      0,
      album.createdAt,
    ],
  )

  for (const [position, title] of album.songs.entries()) {
    await database!.run(
      'INSERT INTO songs (album_id, title, position) VALUES (?, ?, ?)',
      [album.id, title, position],
    )
  }

  state.albums.unshift(album)
  await persistDatabase()
}

export function getAlbum(id: string) {
  return state.albums.find(
    (album) => album.id === id && album.userId === state.sessionId,
  )
}

export async function toggleFavorite(id: string) {
  await initializeStorage()
  const album = getAlbum(id)
  if (!album) return

  album.favorite = !album.favorite
  await database!.run('UPDATE albums SET favorite = ? WHERE id = ?', [
    album.favorite ? 1 : 0,
    album.id,
  ])
  await persistDatabase()
}

export async function removeAlbum(id: string) {
  await initializeStorage()
  const index = state.albums.findIndex(
    (album) => album.id === id && album.userId === state.sessionId,
  )
  if (index < 0) return

  await database!.run('DELETE FROM albums WHERE id = ?', [id])
  state.albums.splice(index, 1)
  await persistDatabase()
}
