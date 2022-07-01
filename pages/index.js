import Layout from '../components/Layout'
import Link from 'next/link'

export default function Home() {

  return (
    <Layout>
        <h1 className='is-size-2 is-size-4-mobile'>Discussbase</h1>
      <h2 className='is-size-4 mb-5'>一个开源论坛 <br></br>
      创建您的讨论平台并完全免费地部署它，使用“技术栈”（MemFire Cloud、Vercel 和 Next.js）。简单第一，专注于你的讨论。

      </h2>

      <div>
        <Link href='/posts'><button className="button is-outlined mr-1">试试看</button></Link>
        <Link href='https://docs.memfiredb.com/'><button className="button is-outlined">阅读文档</button></Link>
      </div>

        <div className='columns mt-6'>
          <div className='column'>
            <figure className='image is-64x64'>
              <img className='is-rounded' src='/MemFire_logo.png' alt='logo'/>
            </figure>
            <h3 className='mt-1 is-size-4'><a href='https://memfiredb.com/'>MemFire Cloud</a></h3>
          <p>
            在不到一分钟的时间内创建一个后端服务。可以使用MemFireDB数据库、身份验证、自动生成API、云存储来开始您的项目
          </p>
          </div>

          <div className='column'>
            <figure className='image is-64x64'>
            <img className='is-rounded' src='/vercel.svg' alt='vercel logo' style={{'width': '64px', 'height': '64px'}} />
            </figure>
            <h3 className='mt-1 is-size-4'><a href='https://vercel.com/'> Vercel</a></h3>
          <p>
          Vercel是一个开放的无服务器平台，适用于静态和混合应用程序，可与您的内容、商业或数据库集成。
            </p>
          </div>

          <div className='column'>
            <figure className='image is-64x64'>
              <img className='is-rounded' src='https://camo.githubusercontent.com/92ec9eb7eeab7db4f5919e3205918918c42e6772562afb4112a2909c1aaaa875/68747470733a2f2f6173736574732e76657263656c2e636f6d2f696d6167652f75706c6f61642f76313630373535343338352f7265706f7369746f726965732f6e6578742d6a732f6e6578742d6c6f676f2e706e67' alt='nextjs logo' />
            </figure>
            <h3 className='mt-1 is-size-4'><a href='https://nextjs.org/'> Nextjs</a></h3>
            <p>Next.js为你提供了最好的开发者体验，以及你在生产中需要的所有功能。</p>
          </div>
        </div>

      
      <script async defer src="https://buttons.github.io/buttons.js"></script>
    </Layout>
  )
}