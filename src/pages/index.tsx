import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
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

export default function Home(): JSX.Element {
  return (
    <>
      <Head>
        <title>Spacetraveling</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.pots}>
          <Link href="/">
            <a>
              <strong>Como utilizar Hooks</strong>
              <p>Pensando em sincronização em vez de ciclos de vida.</p>
              <FiCalendar />
              <time> 15 mar 2021</time>
              <FiUser />
              <span>Joseph Oliveira</span>
            </a>
          </Link>
          <a>
            <strong>Criando um app CRA do zero</strong>
            <p>
              Tudo sobre como criar a sua primeira aplicação utilizando Create
              React App.
            </p>
            <FiCalendar />
            <time> 19 Abr 2021</time>
            <FiUser />
            <span>Danilo Vieira</span>
          </a>

          <a>
            <strong>Como utilizar Hooks</strong>
            <p>Pensando em sincronização em vez de ciclos de vida.</p>
            <FiCalendar />
            <time>15 mar 2021</time>
            <FiUser />
            <span>Joseph Oliveira</span>
          </a>
          <Link href="/">
            <a className={styles.loadingPosts}>Carregar mais posts</a>
          </Link>
        </div>
      </main>
    </>
  );
}

/* export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.author', 'post.banner', 'post.content'],
      pageSize: 2,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      slug: post.uid,
      title: RichText.asText(post.data.title),
      author: RichText.asText(post.data.author),
      subtitle: RichText.asText(post.data.subtitle),
    };
  });

  return {
    props: { posts },
  };
}; */
