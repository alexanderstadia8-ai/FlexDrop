'use client'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { signInWithPopup } from 'firebase/auth'
import { useAuthState } from 'react-firebase-hooks/auth'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { loadStripe } from '@stripe/stripe-js'
import { auth, googleProvider, db, storage } from '@/lib/firebase'
import { CURRENCIES, toEUR } from '@/lib/currencies'
import Navbar from '@/components/Navbar'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
const SUGGESTED = [10, 25, 50, 100, 250, 500]

const COUNTRIES = [
  { code: 'AF', flag: '🇦🇫', name: 'Afghanistan' },
  { code: 'AL', flag: '🇦🇱', name: 'Albania' },
  { code: 'DZ', flag: '🇩🇿', name: 'Algeria' },
  { code: 'AR', flag: '🇦🇷', name: 'Argentina' },
  { code: 'AU', flag: '🇦🇺', name: 'Australia' },
  { code: 'AT', flag: '🇦🇹', name: 'Austria' },
  { code: 'BE', flag: '🇧🇪', name: 'Belgium' },
  { code: 'BR', flag: '🇧🇷', name: 'Brazil' },
  { code: 'CA', flag: '🇨🇦', name: 'Canada' },
  { code: 'CL', flag: '🇨🇱', name: 'Chile' },
  { code: 'CN', flag: '🇨🇳', name: 'China' },
  { code: 'CO', flag: '🇨🇴', name: 'Colombia' },
  { code: 'HR', flag: '🇭🇷', name: 'Croatia' },
  { code: 'CZ', flag: '🇨🇿', name: 'Czech Republic' },
  { code: 'DK', flag: '🇩🇰', name: 'Denmark' },
  { code: 'EG', flag: '🇪🇬', name: 'Egypt' },
  { code: 'FI', flag: '🇫🇮', name: 'Finland' },
  { code: 'FR', flag: '🇫🇷', name: 'France' },
  { code: 'DE', flag: '🇩🇪', name: 'Germany' },
  { code: 'GH', flag: '🇬🇭', name: 'Ghana' },
  { code: 'GR', flag: '🇬🇷', name: 'Greece' },
  { code: 'HK', flag: '🇭🇰', name: 'Hong Kong' },
  { code: 'HU', flag: '🇭🇺', name: 'Hungary' },
  { code: 'IN', flag: '🇮🇳', name: 'India' },
  { code: 'ID', flag: '🇮🇩', name: 'Indonesia' },
  { code: 'IE', flag: '🇮🇪', name: 'Ireland' },
  { code: 'IL', flag: '🇮🇱', name: 'Israel' },
  { code: 'IT', flag: '🇮🇹', name: 'Italy' },
  { code: 'JP', flag: '🇯🇵', name: 'Japan' },
  { code: 'KE', flag: '🇰🇪', name: 'Kenya' },
  { code: 'KR', flag: '🇰🇷', name: 'South Korea' },
  { code: 'LU', flag: '🇱🇺', name: 'Luxembourg' },
  { code: 'MY', flag: '🇲🇾', name: 'Malaysia' },
  { code: 'MX', flag: '🇲🇽', name: 'Mexico' },
  { code: 'MA', flag: '🇲🇦', name: 'Morocco' },
  { code: 'NL', flag: '🇳🇱', name: 'Netherlands' },
  { code: 'NZ', flag: '🇳🇿', name: 'New Zealand' },
  { code: 'NG', flag: '🇳🇬', name: 'Nigeria' },
  { code: 'NO', flag: '🇳🇴', name: 'Norway' },
  { code: 'PK', flag: '🇵🇰', name: 'Pakistan' },
  { code: 'PE', flag: '🇵🇪', name: 'Peru' },
  { code: 'PH', flag: '🇵🇭', name: 'Philippines' },
  { code: 'PL', flag: '🇵🇱', name: 'Poland' },
  { code: 'PT', flag: '🇵🇹', name: 'Portugal' },
  { code: 'RO', flag: '🇷🇴', name: 'Romania' },
  { code: 'RU', flag: '🇷🇺', name: 'Russia' },
  { code: 'SA', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: 'SG', flag: '🇸🇬', name: 'Singapore' },
  { code: 'ZA', flag: '🇿🇦', name: 'South Africa' },
  { code: 'ES', flag: '🇪🇸', name: 'Spain' },
  { code: 'SE', flag: '🇸🇪', name: 'Sweden' },
  { code: 'CH', flag: '🇨🇭', name: 'Switzerland' },
  { code: 'TW', flag: '🇹🇼', name: 'Taiwan' },
  { code: 'TH', flag: '🇹🇭', name: 'Thailand' },
  { code: 'TR', flag: '🇹🇷', name: 'Turkey' },
  { code: 'UA', flag: '🇺🇦', name: 'Ukraine' },
  { code: 'AE', flag: '🇦🇪', name: 'United Arab Emirates' },
  { code: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
  { code: 'US', flag: '🇺🇸', name: 'United States' },
  { code: 'VN', flag: '🇻🇳', name: 'Vietnam' },
  { code: 'OTHER', flag: '🌍', name: 'Other' },
]

const inp: React.CSSProperties = {
  width:'100%', background:'#1a1a1a', border:'1px solid #333',
  borderRadius:10, padding:'11px 14px', fontSize:14, color:'#fff',
  outline:'none', fontFamily:'inherit', display:'block',
}
const lbl: React.CSSProperties = {
  fontSize:11, fontWeight:500, color:'#aaa', textTransform:'uppercase',
  letterSpacing:'.05em', marginBottom:8, display:'block',
}
const card: React.CSSProperties = {
  background:'#111', border:'1px solid #222', borderRadius:16, padding:'1.5rem', marginBottom:'1rem',
}

type UserProfile = {
  country?: string
  flag?: string
  instagram?: string
  twitter?: string
  twitch?: string
  photoURL?: string
}

export default function DonatePage() {
  const [user] = useAuthState(auth)
  const fileRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState<UserProfile>({})
  const [profileLoaded, setProfileLoaded] = useState(false)

  // Profile fields
  const [country, setCountry] = useState('')
  const [instagram, setInstagram] = useState('')
  const [twitter, setTwitter] = useState('')
  const [twitch, setTwitch] = useState('')
  const [customPhoto, setCustomPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  // Donation fields
  const [amount, setAmount] = useState<number>(50)
  const [currency, setCurrency] = useState('EUR')
  const [wish, setWish] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Load existing profile
  useEffect(() => {
    if (!user) return
    getDoc(doc(db, 'user_profiles', user.uid)).then(snap => {
      if (snap.exists()) {
        const data = snap.data() as UserProfile
        setProfile(data)
        setCountry(data.country ?? '')
        setInstagram(data.instagram ?? '')
        setTwitter(data.twitter ?? '')
        setTwitch(data.twitch ?? '')
        if (data.photoURL) setPhotoPreview(data.photoURL)
      }
      setProfileLoaded(true)
    })
  }, [user])

  const login = async () => {
    try { await signInWithPopup(auth, googleProvider) } catch(e) {}
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Photo must be under 5MB'); return }
    setCustomPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const saveProfile = async () => {
    if (!user) return
    if (!country) { setError('Select your country'); return }
    setError('')
    setLoading(true)
    try {
      let photoURL = photoPreview ?? user.photoURL ?? ''
      if (customPhoto) {
        const storageRef = ref(storage, `photos/${user.uid}`)
        await uploadBytes(storageRef, customPhoto)
        photoURL = await getDownloadURL(storageRef)
      }
      const countryData = COUNTRIES.find(c => c.code === country)
      const profileData = {
        uid: user.uid,
        displayName: user.displayName,
        photoURL,
        country: countryData?.name ?? country,
        flag: countryData?.flag ?? '🌍',
        instagram: instagram.replace('@',''),
        twitter: twitter.replace('@',''),
        twitch: twitch.replace('@',''),
        updatedAt: serverTimestamp(),
      }
      await setDoc(doc(db, 'user_profiles', user.uid), profileData, { merge: true })
      setProfile(profileData)
      setStep(2)
    } catch(e) {
      setError('Something went wrong saving your profile.')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = async () => {
    if (!user) return
    if (!wish.trim()) { setError('Write your message!'); return }
    setError('')
    setLoading(true)
    try {
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

      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency, uid: user.uid }),
      })
      const { sessionId } = await res.json()
      const stripe = await stripePromise
      await stripe?.redirectToCheckout({ sessionId })
    } catch(e) {
      console.error(e)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectedCurrency = CURRENCIES.find(c => c.code === currency)
  const photoSrc = photoPreview ?? user?.photoURL ?? null

  return (
    <main style={{background:'#0a0a0a',minHeight:'100vh',color:'#fff'}}>
      <Navbar />
      <div style={{maxWidth:500,margin:'0 auto',padding:'1rem 1rem 3rem'}}>
        <div style={{textAlign:'center',marginBottom:'1.5rem'}}>
          <h1 style={{fontSize:28,fontWeight:500,color:'#fff',marginBottom:6}}>Drop your flex</h1>
          <p style={{fontSize:13,color:'#888'}}>Fill in your profile, pick your amount, claim your spot.</p>
        </div>

        <div style={{display:'flex',gap:6,marginBottom:'1.5rem'}}>
          {[1,2].map(s=>(
            <div key={s} style={{flex:1,height:3,borderRadius:3,background:step>=s?'#CCFF00':'#222',transition:'background .3s'}} />
          ))}
        </div>

        {/* STEP 1 — Profile */}
        {step===1 && (
          <div style={card}>
            <h2 style={{fontSize:18,fontWeight:500,color:'#fff',marginBottom:'1.25rem'}}>Your profile</h2>

            {!user ? (
              <div style={{textAlign:'center',padding:'1.5rem 0'}}>
                <p style={{color:'#888',fontSize:13,marginBottom:'1rem'}}>Sign in to appear on the leaderboard.</p>
                <button onClick={login} style={{background:'#CCFF00',color:'#0a0a0a',border:'none',borderRadius:12,padding:'12px 28px',fontSize:14,fontWeight:600,cursor:'pointer',width:'100%'}}>
                  Continue with Google
                </button>
              </div>
            ) : (
              <div>
                {/* Avatar */}
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:'1.25rem',padding:12,background:'#1a1a1a',borderRadius:12}}>
                  {photoSrc
                    ? <Image src={photoSrc} alt="" width={48} height={48} style={{borderRadius:'50%',objectFit:'cover'}} />
                    : <div style={{width:48,height:48,borderRadius:'50%',background:'#CCFF00',display:'flex',alignItems:'center',justifyContent:'center',color:'#0a0a0a',fontWeight:600,fontSize:18}}>{user.displayName?.[0]}</div>
                  }
                  <div>
                    <div style={{fontWeight:500,fontSize:15,color:'#fff'}}>{user.displayName}</div>
                    <div style={{fontSize:12,color:'#888'}}>{user.email}</div>
                  </div>
                </div>

                <div style={{marginBottom:'1rem'}}>
                  <label style={lbl}>Custom photo (optional)</label>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{display:'none'}} />
                  <button onClick={()=>fileRef.current?.click()} style={{width:'100%',background:'#1a1a1a',border:'1px dashed #444',borderRadius:10,padding:12,fontSize:13,color:'#888',cursor:'pointer'}}>
                    {customPhoto ? `✓ ${customPhoto.name}` : '+ Upload custom photo'}
                  </button>
                </div>

                <div style={{marginBottom:'1rem'}}>
                  <label style={lbl}>Your country <span style={{color:'#CCFF00'}}>*</span></label>
                  <select value={country} onChange={e=>setCountry(e.target.value)} style={{...inp,cursor:'pointer',appearance:'none',WebkitAppearance:'none'}}>
                    <option value="" style={{background:'#1a1a1a',color:'#888'}}>Select country...</option>
                    {COUNTRIES.map(c=>(
                      <option key={c.code} value={c.code} style={{background:'#1a1a1a',color:'#fff'}}>{c.flag} {c.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{marginBottom:'1rem'}}>
                  <label style={lbl}>Twitter/X (optional)</label>
                  <input type="text" value={twitter} onChange={e=>setTwitter(e.target.value)} placeholder="@yourhandle" style={inp} />
                </div>
                <div style={{marginBottom:'1rem'}}>
                  <label style={lbl}>Twitch (optional)</label>
                  <input type="text" value={twitch} onChange={e=>setTwitch(e.target.value)} placeholder="@yourhandle" style={inp} />
                </div>
                <div style={{marginBottom:'1.25rem'}}>
                  <label style={lbl}>Instagram (optional)</label>
                  <input type="text" value={instagram} onChange={e=>setInstagram(e.target.value)} placeholder="@yourhandle" style={inp} />
                </div>

                {profileLoaded && profile.country && (
                  <div style={{background:'#0f1a0f',border:'1px solid #1a3a1a',borderRadius:8,padding:'8px 12px',fontSize:11,color:'#88cc88',marginBottom:12}}>
                    ✓ Profile loaded — update if needed
                  </div>
                )}

                {error && <p style={{color:'#ff6b6b',fontSize:12,marginBottom:12}}>{error}</p>}
                <button onClick={saveProfile} disabled={loading} style={{background:'#CCFF00',color:'#0a0a0a',border:'none',borderRadius:12,padding:13,fontSize:14,fontWeight:600,cursor:'pointer',width:'100%',opacity:loading?0.7:1}}>
                  {loading ? 'Saving...' : 'Save & continue'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2 — Amount & wish */}
        {step===2 && (
          <div style={card}>
            <h2 style={{fontSize:18,fontWeight:500,color:'#fff',marginBottom:'1.25rem'}}>Your drop</h2>

            <div style={{marginBottom:'1rem'}}>
              <label style={lbl}>What would you change? <span style={{color:'#CCFF00'}}>*</span></label>
              <textarea
                value={wish} onChange={e=>setWish(e.target.value)}
                placeholder="What would you change?"
                rows={3} maxLength={200}
                style={{...inp,resize:'none',lineHeight:1.5}}
              />
              <div style={{fontSize:11,color:'#555',textAlign:'right',marginTop:4}}>{wish.length}/200</div>
            </div>

            <div style={{marginBottom:'1rem'}}>
              <label style={lbl}>Currency</label>
              <select value={currency} onChange={e=>setCurrency(e.target.value)} style={{...inp,cursor:'pointer',appearance:'none',WebkitAppearance:'none'}}>
                {CURRENCIES.map(c=>(
                  <option key={c.code} value={c.code} style={{background:'#1a1a1a',color:'#fff'}}>{c.symbol} {c.label} ({c.code})</option>
                ))}
              </select>
            </div>

            <div style={{marginBottom:'1rem'}}>
              <label style={lbl}>Amount</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:10}}>
                {SUGGESTED.map(s=>(
                  <button key={s} onClick={()=>setAmount(s)} style={{
                    padding:10,borderRadius:10,fontSize:14,fontWeight:500,
                    border:amount===s?'1px solid #CCFF00':'1px solid #333',
                    background:amount===s?'#0f1a00':'#1a1a1a',
                    color:amount===s?'#CCFF00':'#fff',cursor:'pointer',
                  }}>
                    {selectedCurrency?.symbol}{s}
                  </button>
                ))}
              </div>
              <input type="number" value={amount} onChange={e=>setAmount(Number(e.target.value))} min={1} placeholder="Custom amount" style={inp} />
            </div>

            <div style={{background:'#1a1a1a',borderRadius:10,padding:'12px 14px',marginBottom:'1rem',display:'flex',justifyContent:'space-between',fontSize:13}}>
              <span style={{color:'#888'}}>Your drop</span>
              <span style={{color:'#FFD700',fontWeight:500}}>{selectedCurrency?.symbol}{amount} {currency}</span>
            </div>

            <div style={{background:'#0f1a00',border:'1px solid #CCFF0033',borderRadius:10,padding:'10px 14px',marginBottom:'1rem',fontSize:12,color:'#CCFF00'}}>
              After payment your face goes live on the leaderboard instantly. 🔥
            </div>

            {error && <p style={{color:'#ff6b6b',fontSize:12,marginBottom:12}}>{error}</p>}
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>setStep(1)} style={{background:'#1a1a1a',border:'1px solid #333',color:'#fff',borderRadius:12,padding:'13px 20px',fontSize:14,fontWeight:500,cursor:'pointer'}}>←</button>
              <button onClick={handleCheckout} disabled={loading||amount<1} style={{background:'#CCFF00',color:'#0a0a0a',border:'none',borderRadius:12,padding:13,fontSize:14,fontWeight:600,cursor:'pointer',flex:1,opacity:loading?0.7:1}}>
                {loading ? 'Processing...' : `Flex ${selectedCurrency?.symbol}${amount} ${currency}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
