import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiUser } from 'react-icons/fi';

import Head from 'next/head';
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  console.log(post);
  return (
    <>
      <Head>
        <title>teste</title>
      </Head>
      <main>
        <article>
          {/* <img src={post.data.banner.url} alt={post.data.title} /> */}
          <h1>{post.data.title}</h1>
          <FiCalendar />
          <time>{post.first_publication_date}</time>
          <FiUser />
          <span>{post.data.author}</span>
          {post.data.content.map(arg => (
            <div key={post.data.title}>
              <p dangerouslySetInnerHTML={{ __html: arg.heading }} />
              {arg.body.map(body => (
                <p
                  key={post.data.author}
                  dangerouslySetInnerHTML={{
                    __html: body.text,
                  }}
                />
              ))}
            </div>
          ))}
        </article>
      </main>
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getStaticPaths = () => {
  // const prismic = getPrismicClient();
  // const posts = await prismic.query();
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    slug,
    first_publication_date: format(
      new Date(response.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
    data: {
      title: response.data.title,
      banner: response.data.banner,
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: { post },
  };
};
