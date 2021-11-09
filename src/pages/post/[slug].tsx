/* eslint-disable react/no-danger */
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import Link from 'next/link';

import Head from 'next/head';
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';
// import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  uid: string;
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
  prevPost: Post | null;
  nextPost: Post | null;
}

export default function Post({
  post,
  prevPost,
  nextPost,
}: PostProps): JSX.Element {
  const readingTime = post.data.content.reduce((sum, content) => {
    const textTime = RichText.asText(content.body).split(' ').length;
    return Math.ceil(sum + textTime / 200);
  }, 0);

  return (
    <>
      <Head>
        <title>{post.data.title}</title>
      </Head>
      <img
        className={styles.banner}
        src={post.data.banner.url}
        alt={post.data.title}
      />
      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.data.title}</h1>
          <div className={styles.infos}>
            <FiCalendar size="20" />
            <time>{post.first_publication_date}</time>
            <FiUser size="20" />
            <span>{post.data.author}</span>
            <FiClock size="20" />
            <time>{readingTime} min</time>
          </div>
          <div className={styles.lastPublicationDate}>
            <p>* editado em {post.last_publication_date}</p>
          </div>
          <div className={styles.content}>
            {post.data.content.map(container => (
              <div key={post.data.title}>
                <h2 className={styles.heading}>{container.heading}</h2>
                <div
                  className={styles.body}
                  dangerouslySetInnerHTML={{
                    __html: String(RichText.asHtml(container.body)),
                  }}
                />
              </div>
            ))}
          </div>
        </article>
      </main>
      <footer className={styles.container}>
        <div className={styles.footer}>
          <div />
          <div className={styles.buttons}>
            {prevPost !== null ? (
              <Link href={`/post/${prevPost.uid}`}>
                <a>
                  <button type="button">
                    {prevPost.data?.title}
                    <span>Ponst anterior</span>
                  </button>
                </a>
              </Link>
            ) : (
              <div />
            )}

            {nextPost !== null ? (
              <Link href={`/post/${nextPost?.uid}`}>
                <a>
                  <button className={styles.nextPost} type="button">
                    {nextPost?.data?.title}
                    <span className={styles.nextPost}>Próximo post</span>
                  </button>
                </a>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </footer>
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title'],
    }
  );

  const responsePost = posts.results.map(slug => slug.uid);

  return {
    paths: responsePost.map(slug => {
      return {
        params: { slug },
      };
    }),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});
  const post = {
    slug,
    uid: response.uid,
    first_publication_date: format(
      new Date(response.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
    last_publication_date: format(
      new Date(response.last_publication_date),
      "dd MMM yyyy, 'às' HH:mm",
      {
        locale: ptBR,
      }
    ),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  const nextPost =
    (
      await prismic.query(Prismic.Predicates.at('document.type', 'post'), {
        pageSize: 1,
        after: `${response.id}`,
        orderings: '[document.first_publication_date]',
      })
    ).results[0] || null;

  const prevPost =
    (
      await prismic.query(Prismic.Predicates.at('document.type', 'post'), {
        pageSize: 1,
        after: `${response.id}`,
        orderings: '[docement.first_publication_date desc]',
      })
    ).results[0] || null;

  return {
    props: { post, prevPost, nextPost },
    revalidate: 60 * 30,
  };
};
