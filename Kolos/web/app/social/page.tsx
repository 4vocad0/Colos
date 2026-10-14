import Feed from "./_components/Feed";
import CreatePost from "./_components/CreatePost";
import styles from "./social.module.css";

export default function SocialPage() {
  return (
    <main className={styles.pageWrapper}>
      <div className={styles.pageContainer}>
        <header className={styles.header}>
          <h1 className={styles.title}>Społeczność</h1>
          <p className={styles.subtitle}>
            Obserwuj postępy znajomych i dziel się swoimi rekordami.
          </p>
        </header>

        {/* Tutaj renderuje się panel dodawania posta */}
        <section className={styles.section}>
          <CreatePost />
        </section>

        {/* Tutaj renderuje się tablica postów */}
        <section>
          <Feed />
        </section>
      </div>
    </main>
  );
}