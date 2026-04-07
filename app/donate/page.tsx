  const handleCheckout = async () => {
    if (!user) return
    if (!wish.trim()) { setError('Write your message!'); return }
    
    setError('')
    setLoading(true)

    try {
      // 1. Salva i dati pending su Firestore
      const countryData = COUNTRIES.find(c => c.code === country)
      const profileSnap = await getDoc(doc(db, 'user_profiles', user.uid))
      const savedProfile = profileSnap.exists() ? profileSnap.data() : {}

      await setDoc(doc(db, 'pending_donations', user.uid), {
        uid: user.uid,
        displayName: user.displayName,
        photoURL: savedProfile.photoURL ?? user.photoURL ?? '',
        amount,
        currency,
        amountEUR: toEUR(amount, currency),
        wish: wish.trim(),
        instagram: savedProfile.instagram ?? '',
        twitter: savedProfile.twitter ?? '',
        twitch: savedProfile.twitch ?? '',
        country: savedProfile.country ?? countryData?.name ?? '',
        flag: savedProfile.flag ?? countryData?.flag ?? '🌍',
        updatedAt: serverTimestamp(),
      })

      // 2. Chiama l'API per creare la sessione
      console.log('🚀 Chiamata API per creare sessione...')
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency, uid: user.uid }),
      })

      const data = await res.json()
      console.log('📦 Risposta API:', data)

      // 3. CONTROLLO CRITICO: Verifica se c'è un errore o se manca il sessionId
      if (!res.ok) {
        throw new Error(data.error || `Errore HTTP: ${res.status}`)
      }

      if (!data.sessionId) {
        console.error('❌ ERRORE GRAVE: Il sessionId è mancante nella risposta:', data)
        throw new Error('Impossibile creare la sessione di pagamento. Controlla le chiavi Stripe su Vercel.')
      }

      // 4. Esegui il redirect solo se abbiamo un sessionId valido
      const stripe = await stripePromise
      if (!stripe) {
        throw new Error('Stripe non è stato caricato correttamente.')
      }

      console.log('✅ Redirect a Stripe con sessionId:', data.sessionId)
      const result = await stripe.redirectToCheckout({ sessionId: data.sessionId })

      if (result.error) {
        throw new Error(result.error.message)
      }

    } catch(e: any) {
      console.error('💥 Errore durante il checkout:', e)
      setError(e.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }