import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';

import { useState } from 'react';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

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

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [nextPages, setNextPages] = useState(postsPagination.next_page);
  const [postResults, setPostResults] = useState<Post[]>([
    ...postsPagination.results,
  ]);

  function handleNextPage(): void {
    fetch(postsPagination.next_page)
      .then(response => response.json())
      .then(data => {
        setPostResults(data.results);
        setNextPages(data.next_page);
      });

    const posts = postResults.map(post => ({
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        author: post.data.author,
        subtitle: post.data.subtitle,
      },
    }));

    setPostResults([...postResults, ...posts]);
  }

  return (
    <>
      <Head>
        <title>Spacetraveling</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.pots}>
          {postResults.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>
                <div className={styles.info}>
                  <FiCalendar size="20" />
                  <time>
                    {format(
                      new Date(post.first_publication_date),
                      'dd MMM yyyy',
                      {
                        locale: ptBR,
                      }
                    )}
                  </time>
                  <FiUser size="20" />
                  <span>{post.data.author}</span>
                </div>
              </a>
            </Link>
          ))}
          {nextPages !== null ? (
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
      pageSize: 2,
    }
  );

  const { next_page } = postsResponse;

  const results = postsResponse.results.map(post => ({
    uid: post.uid,
    first_publication_date: format(
      new Date(post.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
    data: {
      title: post.data.title,
      author: post.data.author,
      subtitle: post.data.subtitle,
    },
  }));

  return {
    props: {
      postsPagination: {
        results,
        next_page,
      },
    },
    revalidate: 60 * 30, // 30 minutes
  };
};
