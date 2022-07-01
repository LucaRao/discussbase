
1、新建应用   
使用memfire cloud(https://cloud.memfiredb.com/)并创建免费的账户   

2、准备数据表
我们需要准备三张表
Profiles (user information)
Posts (thread)
Replies (replies)

创建Profiles表

-- Create a table for Public Profiles
create table profiles (
  id uuid references auth.users not null,
  updated_at timestamp with time zone,
  username text unique not null,
  avatar_url text,
  website text,
  point INTEGER DEFAULT 0,

  primary key (id),
  unique(username),
  constraint username_length check (char_length(username) >= 3)
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );


创建avatars存储桶，用于存储用户头像

-- Set up Storage!
insert into storage.buckets (id, name)
values ('avatars', 'avatars');

create policy "Avatar are public accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Everyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );

create policy "Everyone can update an avatar."
  on storage.objects for update
  with check ( bucket_id = 'avatars' );

创建Posts表

CREATE TABLE posts (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid not null,
  title text not null,
  body text not null,
  slug text not null,
  tag text not null,
  vote INTEGER DEFAULT 0,
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT fk_user
      FOREIGN KEY(user_id) 
      REFERENCES profiles(id)
      ON DELETE SET NULL
);

alter table posts enable row level security;

create policy "Individuals can create posts." on posts for
    insert with check (auth.uid() = user_id);

create policy "Individuals can update their own posts." on posts for
    update using (auth.uid() = user_id);

create policy "Individuals can delete their own posts." on posts for
    delete using (auth.uid() = user_id);

create policy "Posts are public." on posts for
    select using (true);

创建Replies表

CREATE TABLE replies (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  body text,
  user_id uuid not null,
  post_id uuid,
  vote INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_post
      FOREIGN KEY(post_id) 
      REFERENCES posts(id)
      ON DELETE SET NULL,
        CONSTRAINT fk_user
      FOREIGN KEY(user_id) 
      REFERENCES profiles(id)
      ON DELETE SET NULL
);

alter table replies enable row level security;

create policy "Individuals can create replies." on replies for
    insert with check (auth.uid() = user_id);

create policy "Individuals can update their own replies." on replies for
    update using (auth.uid() = user_id);

create policy "Individuals can delete their own replies." on replies for
    delete using (auth.uid() = user_id);

create policy "replies are public." on replies for
    select using (true);
    
设置 postgre 函数以触发更新时间
CREATE OR REPLACE FUNCTION set_timestamp(post_id uuid)
RETURNS void AS 
$$
BEGIN
    UPDATE posts 
    SET updated_at = NOW()
    WHERE id = post_id;
END;
$$ 
LANGUAGE plpgsql;