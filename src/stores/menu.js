import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase.js'

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

// Retire le champ image avant d'écrire dans config/menu
function stripImages(categories) {
  return categories.map(cat => ({
    ...cat,
    items: cat.items.map(({ image, ...item }) => item)
  }))
}

export const useMenuStore = defineStore('menu', () => {
  const data = ref(JSON.parse(JSON.stringify(DEFAULT_MENU)))

  // Chargement Firestore (non bloquant) : structure + images séparées
  Promise.all([
    getDoc(doc(db, 'config', 'menu')),
    getDocs(collection(db, 'menuImages'))
  ]).then(([menuSnap, imgSnaps]) => {
    // Catalogue des images par itemId
    const images = {}
    imgSnaps.forEach(d => { images[d.id] = d.data().data || '' })

    if (menuSnap.exists()) {
      const saved = menuSnap.data()
      saved.categories?.forEach(cat => {
        cat.items?.forEach(item => {
          if (!item.tags) item.tags = []
          if (!item.allergens) item.allergens = []
          item.image = images[item.id] || ''
        })
      })
      data.value = { categories: saved.categories || [] }
    }
  }).catch(console.error)

  // Sauvegarde la structure (sans images) dans config/menu
  async function save() {
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

    // Image dans sa propre collection Firestore
    if ('image' in fields) {
      if (fields.image) {
        setDoc(doc(db, 'menuImages', itemId), { data: fields.image }).catch(console.error)
      } else {
        deleteDoc(doc(db, 'menuImages', itemId)).catch(() => {})
      }
    }

    save()
  }

  function deleteItem(catId, itemId) {
    const cat = data.value.categories.find(c => c.id === catId)
    if (cat) cat.items = cat.items.filter(i => i.id !== itemId)
    deleteDoc(doc(db, 'menuImages', itemId)).catch(() => {})
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
