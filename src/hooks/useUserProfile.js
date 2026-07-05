import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import { normalizeProfile } from '../lib/account'

const emptyProfile = {
  user: null,
  profile: null,
  loading: true,
}

export const useUserProfile = () => {
  const [state, setState] = useState(emptyProfile)

  useEffect(() => {
    let unsubscribeProfile = () => {}

    const unsubscribeAuth = onAuthStateChanged(auth, currentUser => {
      unsubscribeProfile()

      if (!currentUser) {
        setState({ user: null, profile: null, loading: false })
        return
      }

      setState(prev => ({ ...prev, user: currentUser, loading: true }))

      unsubscribeProfile = onSnapshot(
        doc(db, 'users', currentUser.uid),
        snapshot => {
          setState({
            user: currentUser,
            profile: normalizeProfile(snapshot.exists() ? snapshot.data() : null),
            loading: false,
          })
        },
        () => {
          setState({
            user: currentUser,
            profile: null,
            loading: false,
          })
        },
      )
    })

    return () => {
      unsubscribeProfile()
      unsubscribeAuth()
    }
  }, [])

  return state
}
