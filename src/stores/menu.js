import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase.js'

// Les images (base64) restent en localStorage — limite 1Mo/doc Firestore
const LS_IMAGES = 'laromate_menu_images'

const DEFAULT_MENU = {
  categories: [
    {
      id: 'burgers', name: 'Burgers', subtitle: 'Servis avec frites maison et sauce au choix',
      items: [
        { id: 'b1', name: "L'Aromate", desc: "Sauce mayo maison, roquette, tomate, steak, burrata et pesto maison", price: "17€90", tags: [], allergens: ['gluten', 'lactose', 'eggs'] },
        { id: 'b2', name: "Le Chèvre", desc: "Sauce moutarde miel, mâche, tomate, steak, cheddar, chèvre et miel", price: "16€90", tags: ['chef-special'], allergens: ['gluten', 'lactose'] },
        { id: 'b3', name: "L'Avocat", desc: "Sauce mayo maison, mâche, steak ou filet de poulet, cheddar, avocat", price: "16€90", tags: [], allergens: ['gluten', 'lactose', 'eggs'] },
        { id: 'b4', name: "Le Ring", desc: "Sauce bleu maison, mâche, steak, cornichon, cheddar, oignons rings", price: "16€90", tags: [], allergens: ['gluten', 'lactose', 'eggs'] },
        { id: 'b5', name: "Le Breakfast", desc: "Sauce maison, steak, cheddar, œuf, bacon, oignon, cornichon", price: "16€90", tags: [], allergens: ['gluten', 'lactose', 'eggs'] },
        { id: 'b6', name: "Le Classique", desc: "Sauce maison, oignon, tomate, cornichon, steak, cheddar", price: "14€90", tags: [], allergens: ['gluten', 'lactose'] },
      ]
    },
    {
      id: 'sandwichs', name: 'Sandwichs', subtitle: 'Servis avec frites maison et sauce au choix',
      items: [
        { id: 's1', name: "La Bavette", desc: "Sauce poivre, mâche, oignon, bavette mariné, sauce cheddar maison", price: "16€90", tags: [], allergens: ['gluten', 'lactose'] },
        { id: 's2', name: "Le Thaï", desc: "Sauce thaï, mâche, oignon, tomate, poulet mariné épicé, sauce cheddar maison", price: "15€90", tags: ['spicy'], allergens: ['gluten', 'lactose'] },
        { id: 's3', name: "Le Smashé", desc: "Sauce barbecue, mâche, cornichon, steak smashé, cheddar, bacon de veau, sauce cheddar maison", price: "15€90", tags: ['chef-special'], allergens: ['gluten', 'lactose'] },
        { id: 's4', name: "Le Falafel", desc: "Sauce mayo, tomate, cornichon, choux rouges confits, feto, persil, falafel maison, sauce cheddar maison", price: "15€90", tags: ['vegetarian'], allergens: ['gluten', 'lactose', 'eggs', 'nuts'] },
        { id: 's5', name: "Le Parmegiano", desc: "Sauce mayo, roquette, tomate, oignon, steak smashé, mozzarella, pesto maison, parmesan rapé, sauce cheddar maison", price: "16€90", tags: [], allergens: ['gluten', 'lactose', 'eggs', 'nuts'] },
        { id: 's6', name: "Le Philly's", desc: "Sauce mayo, roquette, poivron, oignon, entrecôte, sauce cheddar maison", price: "19€90", tags: [], allergens: ['gluten', 'lactose'] },
        { id: 's7', name: "Le Crémeux", desc: "Sauce boursin, champignon, tomate, oignon, poulet à la crème, sauce cheddar maison", price: "15€90", tags: [], allergens: ['gluten', 'lactose'] },
      ]
    },
    {
      id: 'pates', name: 'Pâtes', subtitle: 'Les pâtes sont servies seules',
      items: [
        { id: 'p1', name: "La Saumon", desc: "Tagliatelles à la crème, saumon fumé, persil, parmigiano reggiano", price: "13€90", tags: [], allergens: ['gluten', 'lactose', 'fish'] },
        { id: 'p2', name: "La Forestière", desc: "Tagliatelles à la crème, sauce champignon, morceau de poulet, persil, parmigiano reggiano", price: "13€90", tags: ['vegetarian'], allergens: ['gluten', 'lactose'] },
      ]
    },
    {
      id: 'salades', name: 'Salades', subtitle: 'Les salades sont servies seules',
      items: [
        { id: 'sa1', name: "La César", desc: "Mélange de salades, poulet caramélisé, tomates cerises, croûtons, mozzarella, sauce vinaigrette et pesto maison", price: "13€90", tags: [], allergens: ['gluten', 'lactose', 'eggs', 'fish'] },
        { id: 'sa2', name: "La Saumon", desc: "Mélange de salades, saumon fumé, tomates cerises, croûtons, avocat, mozzarella, sauce vinaigrette et pesto maison", price: "14€90", tags: [], allergens: ['gluten', 'lactose', 'fish', 'nuts'] },
      ]
    },
    {
      id: 'desserts', name: 'Desserts', subtitle: '',
      items: [
        { id: 'd1', name: "Le Tiramisu", desc: "Recette maison", price: "7€90", tags: ['vegetarian'], allergens: ['gluten', 'lactose', 'eggs'] },
        { id: 'd2', name: "Cheesecake", desc: "Recette maison", price: "7€90", tags: ['vegetarian'], allergens: ['gluten', 'lactose', 'eggs'] },
        { id: 'd3', name: "Café", desc: "", price: "2€20", tags: ['vegan', 'gluten-free'], allergens: [] },
        { id: 'd4', name: "Thé", desc: "Thé vert, thé noir, infusion", price: "3€90", tags: ['vegan', 'gluten-free'], allergens: [] },
        { id: 'd5', name: "Soft", desc: "Dr Pepper, Pulco, Canada Dry, San Pellegrino", price: "2€20", tags: ['vegan', 'gluten-free'], allergens: [] },
      ]
    }
  ]
}

function loadImages() {
  try { return JSON.parse(localStorage.getItem(LS_IMAGES) || '{}') } catch { return {} }
}

function saveImages(images) {
  try { localStorage.setItem(LS_IMAGES, JSON.stringify(images)) } catch {}
}

// Retire le champ image avant d'envoyer à Firestore
function stripImages(categories) {
  return categories.map(cat => ({
    ...cat,
    items: cat.items.map(({ image, ...item }) => item)
  }))
}

// Réinjecte les images depuis localStorage
function mergeImages(categories, images) {
  return categories.map(cat => ({
    ...cat,
    items: cat.items.map(item => ({ ...item, image: images[item.id] || '' }))
  }))
}

export const useMenuStore = defineStore('menu', () => {
  const data = ref(JSON.parse(JSON.stringify(DEFAULT_MENU)))
  const _images = ref(loadImages())

  // Chargement Firestore (non bloquant)
  getDoc(doc(db, 'config', 'menu')).then(snap => {
    if (snap.exists()) {
      const saved = snap.data()
      // Migration : garantit tags/allergens
      saved.categories?.forEach(cat => {
        cat.items?.forEach(item => {
          if (!item.tags) item.tags = []
          if (!item.allergens) item.allergens = []
        })
      })
      data.value = { categories: mergeImages(saved.categories || [], _images.value) }
    }
  }).catch(console.error)

  async function save() {
    // Sauvegarde les images séparément
    const images = {}
    data.value.categories.forEach(cat => {
      cat.items.forEach(item => { if (item.image) images[item.id] = item.image })
    })
    _images.value = images
    saveImages(images)

    // Firestore : sans les images
    await setDoc(doc(db, 'config', 'menu'), {
      categories: stripImages(JSON.parse(JSON.stringify(data.value.categories)))
    })
  }

  function addCategory(cat) {
    data.value.categories.push({ ...cat, items: [] })
    save()
  }

  function updateCategory(id, fields) {
    const cat = data.value.categories.find(c => c.id === id)
    if (cat) Object.assign(cat, fields)
    save()
  }

  function deleteCategory(id) {
    data.value.categories = data.value.categories.filter(c => c.id !== id)
    save()
  }

  function addItem(catId, item) {
    const cat = data.value.categories.find(c => c.id === catId)
    if (cat) cat.items.push({ ...item, id: crypto.randomUUID(), tags: item.tags || [], allergens: item.allergens || [] })
    save()
  }

  function updateItem(catId, itemId, fields) {
    const cat = data.value.categories.find(c => c.id === catId)
    if (!cat) return
    const item = cat.items.find(i => i.id === itemId)
    if (item) Object.assign(item, fields)
    save()
  }

  function deleteItem(catId, itemId) {
    const cat = data.value.categories.find(c => c.id === catId)
    if (cat) cat.items = cat.items.filter(i => i.id !== itemId)
    save()
  }

  const totalItems = computed(() =>
    data.value.categories.reduce((sum, cat) => sum + cat.items.length, 0)
  )

  return {
    data, totalItems,
    addCategory, updateCategory, deleteCategory,
    addItem, updateItem, deleteItem
  }
})
