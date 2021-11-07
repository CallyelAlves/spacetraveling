import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

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
  const readingTime = post.data.content.reduce((sum, content) => {
    const textTime = RichText.asText(content.body).split(' ').length;
    return Math.ceil((sum + textTime) / 200);
  }, 0);

  const body = post.data.content.reduce((prev, container) => {
    const data = RichText.asHtml(container.body);
    return data;
  }, '');

  return (
    <>
      <Head>
        <title>{post.data.title}</title>
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <img
            className={styles.banner}
            src={post.data.banner.url}
            alt={post.data.title}
          />
          <h1>{post.data.title}</h1>
          <div className={styles.infos}>
            <FiCalendar />
            <time>{post.first_publication_date}</time>
            <FiUser />
            <span>{post.data.author}</span>
            <FiClock />
            <time>{readingTime} min</time>
          </div>
          <div className={styles.content}>
            {post.data.content.map(heading => (
              <div
                className={styles.contentHeading}
                dangerouslySetInnerHTML={{ __html: heading.heading }}
              />
            ))}
            <div dangerouslySetInnerHTML={{ __html: body }} />
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
