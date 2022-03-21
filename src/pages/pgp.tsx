import styles from './pgp.module.sass';
import Left from '~/components/Left';
import { RouterLink } from 'vue-router';
import copyOutlined from '@iconify-icons/ant-design/copy-outlined.js';
import downloadOutlined from '@iconify-icons/ant-design/download-outlined.js';
import Icon from '~/components/Icon';

export default defineComponent({
  setup() {
    useHead({
      title: 'GPG 公钥',
      link: [
        { rel: 'canonical', href: 'https://clansty.com/pgp' },
      ],
      meta: [
        { property: 'og:url', content: 'https://clansty.com/pgp' },
        { name: 'description', content: '凌莞 GPG 公钥的复制与下载' },
      ],
    });

    const { copy, copied } = useClipboard({ source: pubKey });

    return () => (
      <div class={styles.pgpContainer}>
        <div class={styles.back}>
          <RouterLink to="/">
            <Left/>
          </RouterLink>
        </div>
        <div class={styles.id} title="DFE7 C051 95DA 2F2B F144  81CF 3A6B E8BA F2ED E134">
          <span>3A6B</span>
          <span>E8BA</span>
          <span>F2ED</span>
          <span>E134</span>
        </div>
        <div class={styles.buttons}>
          <div onClick={() => copy()} tabindex={0} role="button">
            <Icon icon={copyOutlined}/>
            <span class={styles.text}>
              {copied.value ? '已复制！' : '复制公钥到剪贴板'}
            </span>
          </div>
          <div onClick={download} tabindex={0} role="button">
            <Icon icon={downloadOutlined}/>
            <span class={styles.text}>下载公钥</span>
          </div>
        </div>
      </div>
    );
  },
});

function download() {
  const blob = new Blob([pubKey]);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Clansty Rin (凌莞)_0x0BBCB8C1_public.asc';
  link.click();
}

const pubKey = `-----BEGIN PGP PUBLIC KEY BLOCK-----

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
ROXijz5OwNsJsatiB8S6ku3BmZg5Agf08A0=
=i5ml
-----END PGP PUBLIC KEY BLOCK-----
`;
