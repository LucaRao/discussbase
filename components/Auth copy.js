import { useState } from 'react'
import { supabase } from '../utils/supabaseClient'

export default function Auth() {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleLogin = async (email) => {
        try {
            setLoading(true)
            const { error } = await supabase.auth.signIn({ email , password })
            if (error) throw error
            // alert('登录成功！')
        } catch (error) {
            alert(error.error_description || error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleLogUp = async () => {
        try {
            setLoading(true)
            const { error } = await supabase.auth.signUp({ email , password })
            if (error) throw error
            // alert('注册成功，直接帮你登录！')
        } catch (error) {
            alert(error.error_description || error.message)
        } finally {
            setLoading(false)
        }
    }

    async function signInWithSocial(provider) {
        const { user, session, error } = await supabase.auth.signIn({
            provider: provider
        });
    }

    return (
        <div className="columns">
            <div className="column is-half is-offset-one-quarter">
            <h3 className='title'>加入讨论</h3>

            <div>
                <p className="is-size-5 mb-1">邮箱注册</p>
                <div>
                    <input
                        className="input mb-2"
                        type="email"
                        placeholder="您的邮箱"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <input
                        className="input mb-2"
                        type="password"
                        placeholder="您的密码"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div>
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            handleLogin(email,password)
                        }}
                            className="button is-primary is-fullwidth"
                        disabled={loading}
                    >
                        <span>{loading ? 'Loading' : '登录'}</span>
                    </button>
                </div>
                <div>
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            handleLogUp(email,password)
                        }}
                            className="button is-primary is-fullwidth"
                            style={{"marginTop":'20px'}}
                        disabled={loading}
                    >
                        <span>{loading ? 'Loading' : '注册'}</span>
                    </button>
                </div>
            </div>
        </div>
        </div>
    )
}