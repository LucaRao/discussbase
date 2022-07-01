import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../utils/supabaseClient';
import TimeAgo from 'react-timeago'
import isProfileExists from '../utils/isProfileExists';
import Avatar from './Avatar';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown'

export default function Reply({post_id, replies}) {
    const [blockMsg, setBlockMsg] = useState('')
    const [selectedReply, setSelectedReply] = useState('')
    const [editMode, setEditMode] = useState(false)
    const [replyList, setReplyList] = useState(replies)
    const { handleSubmit, register, setValue, formState: { errors } } = useForm();
    
    const user_session = supabase.auth.session()

    useEffect(() => {
        checkAuthUser()
    }, [])

    async function checkAuthUser() {
        const profileExists = await isProfileExists()
        if (!profileExists) {
            setBlockMsg('Create username first to join conversation')
        }

        if (user_session == null) {
            setBlockMsg('Login to join conversation')
        }
    }


    const onSubmit = handleSubmit(async (formData) => {
        let method = 'POST'
        let url_endpoint = '/api/replies/create'

        //attach session user
        formData['access_token'] = user_session.access_token
        formData['post_id'] = post_id

        //Show new change directly
        let parsedUserData = JSON.parse(localStorage.getItem('userData'));
        let newReply = {
            id: 'tempId',
            body: formData['body'],
            created_at: new Date(),
            commenter: {
                id: parsedUserData.id,
                username: parsedUserData.username,
                avatar_url: parsedUserData.avatar_url,
            }
        }

        if(editMode == true) {
            method = 'PUT'
            url_endpoint = '/api/replies/update'
            formData['reply_id'] = selectedReply

            //Live response
            const selectedIndex = document.querySelector(`.reply_text[data-id='${selectedReply}']`).getAttribute('data-index')

            const updatedReplies = replyList.map((reply, index) => {
                if (selectedIndex == index) {
                    reply.body = formData['body']
                }
                return reply
            })
            setReplyList(updatedReplies)
        } else {
            setReplyList(oldReplies => [...oldReplies, newReply])

            //scroll to new reply
            const el = document.querySelector(`#reply-${ replyList.length }`);
            el.scrollIntoView({
                behavior: 'smooth'
            });
        }

        //empty textarea
        setValue('body', '')
        
        fetch(url_endpoint, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        }).then(response => response.json())
            .then(async (data) => {
                if(editMode == true){
                    setEditMode(false)
                } 
                else {
                    //callback to get newest state
                    setReplyList((state) => {
                        let updatedReplies = []
                        state.map((reply, index) => {
                            //update id of newest reply added
                            if ((state.length - 1) == index) {
                                reply.id = data.reply.id
                            }
                            updatedReplies.push(reply)
                        })

                        return updatedReplies;
                    });
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    });

    async function editComment(e){
        e.preventDefault();

        const reply_index = e.currentTarget.getAttribute("data-index")
        const reply_id = replyList[reply_index].id
        const replyTextarea = document.getElementsByTagName('textarea')[0]

        let { data, error } = await supabase
            .from('replies')
            .select('*')
            .eq('id', reply_id)
            .single()
        
        if(error) {
            alert("sorry.. something is wrong.")
            return
        }
        
        replyTextarea.focus()
        replyTextarea.value = data.body
        setSelectedReply(reply_id)
        setEditMode(true)
    }

    async function confirmDelete(e) {
        e.preventDefault();
        const result = confirm('Are you sure you want to delete this reply?')
        const reply_index = e.currentTarget.getAttribute("data-index")
        const reply_id = replyList[reply_index].id
        
        if(result == true) {
            let formData = {
                reply_id : reply_id,
                access_token : user_session.access_token
            }

            fetch('/api/replies/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            }).then(response => response.json())
                .then(data => {
                    const freshReplies = replyList.filter((item, index) => index != reply_index )
                    setReplyList(freshReplies)
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        }
    }

    function cancelEditMode() {
        document.getElementsByTagName('textarea')[0].value = ''
        setEditMode(false)
    }

    return(
        <div>
            { blockMsg != ''
            ? <div className='notification'>{blockMsg}</div>
            :  <form className='mb-4' onSubmit={onSubmit}>
                    <div>
                    <textarea
                        className="textarea mb-1"
                        placeholder="your reply..."
                        {...register('body', { required: 'Subject is required',
                            minLength: { value: 10, message: 'minimal 10 characters'}})}></textarea>
                        {errors.body && (
                            <span role="alert" className="has-text-danger">
                                {errors.body.message}
                            </span>
                        )}</div>

                    {editMode 
                        ? <> 
                            <button type="submit" className="button is-primary"> Update </button> &nbsp;
                            <button onClick={cancelEditMode} className="button has-background-danger has-text-white"> Cancel </button>
                        </>
                        : <button type="submit" className="button is-primary is-fullwidth"> Reply </button>
                    }
                </form>
            }

            <div>
                {replyList.map((reply, index) => {
                    let commentOwner = false

                    if (user_session) {
                        if (user_session.user) {
                            if (user_session.user.id == reply.commenter.id) {
                                commentOwner = true
                            }
                        }
                    }

                    return <div key={index} className='columns is-mobile reply_box mb-3' id={'reply-' +index}>
                            <div className='column is-narrow'>
                                <Avatar username={reply.commenter.username} avatar_url={reply.commenter.avatar_url} size='48' />
                            </div>
                            <div className='column'>
                                <p className='reply_text' data-id={reply.id} data-index={index}>
                                    <ReactMarkdown>{reply.body}</ReactMarkdown>
                                    </p>
                                <small className='has-text-grey'><Link href={'/user/' + reply.commenter.username}><a className='has-text-grey'>@{reply.commenter.username} </a></Link>
                                replied <TimeAgo date={reply.created_at} /> </small>

                                {commentOwner &&
                                    <div>
                                        <a onClick={editComment} data-index={index}>Edit</a> &nbsp;
                                        <a onClick={confirmDelete} data-index={index}>Delete</a>
                                    </div>
                                }
                            </div>
                        </div>
                })}
            </div>  
        </div>
    )
}