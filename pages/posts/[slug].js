import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { supabase } from '../../utils/supabaseClient'
import Link from 'next/link';
import Head from 'next/head'
import Reply from '../../components/Reply';
import TimeAgo from 'react-timeago'
import capitalize from '../../utils/capitalize';
import Avatar from '../../components/Avatar';
import ReactMarkdown from 'react-markdown'

export default function Post({post}) {
    const [owner, setOwner] = useState(false)
    const user_session = supabase.auth.session()
    
    useEffect(() => {
        if (user_session) {
            if(user_session.user) {
                fetchUserData()
                if (user_session.user.id == post.owner.id) {
                    setOwner(true)
                }
            }
        }
    }, [user_session, post.owner.id])

    async function fetchUserData() {
        //For faster respond on reply, save it on localstorage
        
        //check if already in localstorage no need
        const localUserData = localStorage.getItem('userData')
        if(localUserData) {
            return
        }

        let { data, error } = await supabase
            .from('profiles')
            .select(`id, username, avatar_url`)
            .eq('id', user_session.user.id)
            .single()

        if(!error) {
            const userData = {'id' : data.id, 'username': data.username, 'avatar_url': data.avatar_url}
            localStorage.setItem('userData', JSON.stringify(userData))
        }
    }



    async function confirmDelete(e) {
        e.preventDefault();
        const result = confirm('Are you sure you want to delete this post?')
        
        if(result == true) {

            let formData = {
                post_id : post.id,
                access_token : user_session.access_token
            }

            fetch('/api/posts/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            }).then(response => response.json())
                .then(data => {
                    window.location.href = '/posts'
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        }
    }

    return (
        <Layout>
        <Head>
         <title>{post.title}</title>
         <meta name="description" content={post.body.substring(0,140).trim()} />
       </Head>
            <div className="columns">
            
            <div className="column is-2">
                <div className="is-flex-mobile">
                    <div className="mr-2">
                        <Avatar username={post.owner.username} avatar_url={post.owner.avatar_url} size="32"/>
                    </div>
                    <p className='mr-1'><small> <Link href={'/user/' + post.owner.username}><a className='has-text-dark'>@{post.owner.username} </a></Link> 
                                    posted <TimeAgo date={post.created_at} /></small></p>
                    <p> <Link href={'/posts/tag/' + post.tag}><a className='tag is-link is-light'>{post.tag}</a></Link></p>
                </div>

                {owner &&
                    <div className='mt-2'>
                        <Link href={'/posts/create?post=' + post.slug}><a className=''> Edit </a></Link>&nbsp;
                        <a className='' onClick={confirmDelete}>Delete</a>
                    </div>
                }
            </div>


            <div className="column">
                <h1 className='is-size-3 mb-2'>{capitalize(post.title)}</h1>
                <div className='mb-4'>
                    <ReactMarkdown>{post.body}</ReactMarkdown>
                </div>

                <Reply post_id={post.id} replies={post.replies} />
            </div>
        </div>

        </Layout>
    )
}

export async function getServerSideProps(context) {
    const { data: post, error } = await supabase
        .from('posts')
        .select(`
                    *, 
                    owner:user_id(
                        id, username, avatar_url
                    ),
                    replies(
                        id, body, created_at,
                        commenter:user_id(id, username, avatar_url)
                    )
                `)
        .eq('slug', context.params.slug)
        .order('created_at', { ascending: true, foreignTable: 'replies' })
        .single()
    
    if (!post) {
        return {
            notFound: true,
        }
    }

    return {
        props: {
            post: post,
        },
    };
}
