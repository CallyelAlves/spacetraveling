/* eslint-disable react/no-danger */
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import Head from 'next/head';
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';
// import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
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
  const readingTime = post.data.content.reduce((sum, content) => {
    const textTime = RichText.asText(content.body).split(' ').length;
    return Math.ceil(sum + textTime / 200);
  }, 0);

  const timeLast = post.last_publication_date.split(' ');

  function timeLastDate(): string {
    let result = '';
    for (let i = 0; i < 3; i += 1) {
      if (timeLast[i] === timeLast[2]) {
        result += timeLast[i];
      } else {
        result += `${timeLast[i]} `;
      }
    }
    return result;
  }

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
            <p>
              * editado em {timeLastDate()}, às{' '}
              {post.last_publication_date.split(' ')[3]}
            </p>
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
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getStaticPaths: GetStaticPaths = async () => {
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
    last_publication_date: format(
      new Date(response.last_publication_date),
      'dd MMM yyyy hh:mm',
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

  return {
    props: { post },
    revalidate: 60 * 30,
  };
};
