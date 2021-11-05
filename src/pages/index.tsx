import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';

import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
// eslint-disable-next-line import/order
import { RichText } from 'prismic-dom';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

/* fetch(next_page)
      .then(response => response.json())
      .then(data => setNewResults(data));
      const post = newResults.map(post => {
        return {
          uid: post.uid,
          first_publication_date: new Date(
          post.first_publication_date
        ).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        data: {
          title: post.data.title,
          author: post.data.author,
          subtitle: post.data.subtitle,
        },
      }
    } */

export default function Home({
  results,
  next_page,
}: PostPagination): JSX.Element {
  const [nextPage, setNextPage] = useState<Post[]>([...results]);

  async function handleNextPage(): Promise<void> {
    await fetch(next_page)
      .then(response => response.json())
      .then(data => setNextPage(data.results));

    const posts = nextPage.map(post => ({
      uid: post.uid,
      first_publication_date: new Date(
        post.first_publication_date
      ).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      data: {
        title: post.data.title,
        author: post.data.author,
        subtitle: post.data.subtitle,
      },
    }));
    setNextPage([...results, ...posts]);
    console.log(nextPage);
  }
  console.log(next_page);
  return (
    <>
      <Head>
        <title>Spacetraveling</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.pots}>
          {nextPage.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <FiCalendar />
                <time>{post.first_publication_date}</time>
                <FiUser />
                <span>{post.data.author}</span>
              </a>
            </Link>
          ))}
          {next_page !== undefined ? (
            <button
              type="button"
              onClick={handleNextPage}
              className={styles.loadingPosts}
            >
              Carregar mais posts
            </button>
          ) : (
            ''
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: [
        'post.title',
        'post.subtitle',
        'post.author',
        'post.banner',
        'post.content',
      ],
      pageSize: 1,
    }
  );

  const { next_page } = postsResponse;

  const results = postsResponse.results.map(post => ({
    uid: post.uid,
    first_publication_date: new Date(
      post.first_publication_date
    ).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    data: {
      title: post.data.title,
      author: post.data.author,
      subtitle: post.data.subtitle,
    },
  }));

  return {
    props: { results, next_page },
    revalidate: 60 * 30,
  };
};
