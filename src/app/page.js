'use client'

import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material'
import { auth, provider, signInWithPopup, signOut, firestore } from '@/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [user, setUser] = useState(null)

  const updateInventory = async (userId) => {
    const snapshot = query(collection(firestore, `users/${userId}/inventory`))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() })
    })
    setInventory(inventoryList)
    setSearchResults(inventoryList)
  }

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        updateInventory(currentUser.uid)
      } else {
        setUser(null)
        setInventory([])
        setSearchResults([])
      }
    })
  }, [])

  const addItem = async (item) => {
    if (!user) return
    const docRef = doc(collection(firestore, `users/${user.uid}/inventory`), item.trim().toLowerCase())
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1 })
    } else {
      await setDoc(docRef, { quantity: 1 })
    }
    await updateInventory(user.uid)
  }

  const removeItem = async (item) => {
    if (!user) return
    const docRef = doc(collection(firestore, `users/${user.uid}/inventory`), item.trim().toLowerCase())
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1 })
      }
    }
    await updateInventory(user.uid)
  }

  const deleteItem = async (item) => {
    if (!user) return
    const docRef = doc(collection(firestore, `users/${user.uid}/inventory`), item.trim().toLowerCase())
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
        await deleteDoc(docRef)
    }
    await updateInventory(user.uid)
  }

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleSearch = () => {
    const filteredItems = inventory.filter(item =>
      item.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
    )
    setSearchResults(filteredItems)
  }

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error('Error logging in:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
    >
      <Box display="flex" justifyContent="space-between" width="100%" padding={2}>
        {user ? (
          <Button variant="contained" onClick={handleLogout}>
            Logout
          </Button>
        ) : (
          <Button variant="contained" onClick={handleLogin}>
            Login with Google
          </Button>
        )}
      </Box>
      {user && (
        <>
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Add Item
              </Typography>
              <Stack width="100%" direction={'row'} spacing={2}>
                <TextField
                  id="outlined-basic"
                  label="Item"
                  variant="outlined"
                  fullWidth
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
                <Button
                  variant="outlined"
                  onClick={() => {
                    addItem(itemName)
                    setItemName('')
                    handleClose()
                  }}
                >
                  Add
                </Button>
              </Stack>
            </Box>
          </Modal>
          <Stack direction={'row'} spacing={2} alignItems={'center'} sx={{ width: '42%' }}>
            <TextField
              id="search-field"
              label="Search"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
            />
            <Button variant="contained" sx={{ width: '30%' }} onClick={handleSearch}>
              Search
            </Button>
            <Button variant="contained" sx={{ width: '50%' }} onClick={handleOpen}>
              Add New Item
            </Button>
          </Stack>
          <Box border={'1px solid #333'} marginTop={2}>
            <Box
              width="800px"
              height="100px"
              bgcolor={'#ADD8E6'}
              display={'flex'}
              justifyContent={'center'}
              alignItems={'center'}
            >
              <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
                Inventory Items
              </Typography>
            </Box>
            <Stack width="800px" height="300px" spacing={2} overflow={'auto'}>
              {searchResults.length > 0 ? (
                searchResults.map(({ name, quantity }) => (
                  <Box
                    key={name}
                    width="100%"
                    minHeight="150px"
                    display={'flex'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                    bgcolor={'#f0f0f0'}
                    paddingX={5}
                  >
                    <Typography variant={'h3'} color={'#333'} textAlign={'center'}>
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Typography>
                    <Typography variant={'h3'} color={'#333'} textAlign={'center'}>
                      Quantity: {quantity}
                    </Typography>
                    <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                      <Box display="flex" gap={1}>
                        <Button variant="contained" sx={{ fontWeight: 'bold' }} onClick={() => removeItem(name)}>
                          -
                        </Button>
                        <Button variant="contained" sx={{ fontWeight: 'bold' }} onClick={() => addItem(name)}>
                          +
                        </Button>
                      </Box>
                      <Button variant="outlined" sx={{ marginTop: 1 }} onClick={() => deleteItem(name)}>
                        Delete
                      </Button>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography variant={'h6'} color={'#333'} textAlign={'center'}>
                  No items found
                </Typography>
              )}
            </Stack>
          </Box>
        </>
      )}
    </Box>
  )
}
