// js/favoritos.js · El ÚNICO archivo que toca localStorage. Guardamos solo los códigos alpha_3 (ej. COL).
const CLAVE = "explorador-paises:favoritos";

export const leerFavoritos = () => {
  try {
    const lista = JSON.parse(localStorage.getItem(CLAVE) ?? "[]");
    return Array.isArray(lista) ? lista : []; // si alguien dejó basura en la clave, la app sigue viva
  } catch {
    return [];
  }
};

export const guardarFavoritos = (lista) => {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(lista));
  } catch {
    /* modo privado o lleno */
  }
};

export const esFavorito = (lista, id) => lista.includes(id);

export const alternarFavorito = (lista, id) =>
  esFavorito(lista, id) ? lista.filter((x) => x !== id) : [...lista, id];
