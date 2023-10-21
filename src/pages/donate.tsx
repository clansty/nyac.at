import styles from './donate.module.sass';
import BackButton from '~/components/BackButton';
import random from '~/utils/random';
import TronIcon from '~/icons/tron.svg';
import ECnyIcon from '~/icons/eCNY.svg';
import AfdianIcon from '~/icons/afdian.svg';
import { Icon } from '@iconify/vue';
import usdtIcon from '@iconify-icons/cryptocurrency/usdt.js';
import usdcIcon from '@iconify-icons/cryptocurrency/usdc.js';
import QrcodeInternal from '@chenfengyuan/vue-qrcode';
import copyOutlined from '@iconify-icons/ant-design/copy-outlined';
import ethIcon from '@iconify-icons/cryptocurrency/eth.js';
import successIcon from '@iconify-icons/mdi/success.js';
import ScrollContainer from '~/components/ScrollContainer';

const TRX_ADDR = 'TEnSLLsRmda44k8b1PF12Dj8yNRcCcJxYK';
const ETH_ADDR = '0x3Aa7d1c5CE8C54320771cFEb5bC50B213Fdc943e';
const AFDIAN = 'https://afdian.net/a/Clansty';

export default defineComponent({
  setup() {
    useHead({
      title: '请凌莞' + random.choose(['吃薯片', '喝可乐', '喝奶茶', '吃海底捞', '捞海底谭', '吃肯德基', '吃麦当劳', '打 maimai']),
      link: [
        { rel: 'canonical', href: 'https://nyac.at/donate' },
      ],
      meta: [
        { property: 'og:url', content: 'https://nyac.at/donate' },
        { name: 'description', content: '请凌莞喝奶茶' },
        { property: 'og:title', content: '请凌莞喝奶茶' },
        { property: 'og:description', content: '请凌莞喝奶茶' },
        { property: 'twitter:title', content: '请凌莞喝奶茶' },
        { property: 'twitter:description', content: '请凌莞喝奶茶' },
      ],
    });

    return () => <div class={styles.container}>
      <BackButton to="/"/>
      <ScrollContainer>
        <div class={styles.grid}>
          <div>
            <div class={styles.data}>
              <div class={styles.icons}>
                <span style={{ color: '#C73329' }}><TronIcon/></span>
                <span style={{ color: '#4EAA92' }}><Icon icon={usdtIcon}/></span>
                <span style={{ color: '#2773C2' }}><Icon icon={usdcIcon}/></span>
              </div>
              <div>
                Tron / USDT / USDC (TRC-20)
              </div>
              <CopyBox value={TRX_ADDR}/>
            </div>
            <Qrcode value={TRX_ADDR}/>
          </div>
          <div>
            <div class={styles.data}>
              <div class={styles.icons}>
                <span style={{ color: '#627EEA' }}><Icon icon={ethIcon}/></span>
              </div>
              <div>
                Ethereum
              </div>
              <CopyBox value={ETH_ADDR}/>
            </div>
            <Qrcode value={ETH_ADDR}/>
          </div>
          <div>
            <div class={styles.data}>
              <div class={styles.icons}>
                <span style={{ color: '#e62129' }}><ECnyIcon/></span>
              </div>
              <div>
                数字人民币 (e-CNY)
              </div>
              <CopyBox value="0081000544921986" name="Wallet ID"/>
            </div>
          </div>
          <div class={styles.pointer} onClick={() => window.open(AFDIAN)}>
            <div class={styles.data}>
              <div class={styles.icons}>
                <span style={{ color: '#946ce6' }}><AfdianIcon/></span>
              </div>
              <div>
                爱发电 (WeChat / Alipay)
              </div>
            </div>
            <Qrcode value={AFDIAN}/>
          </div>
        </div>
      </ScrollContainer>
    </div>;
  },
});

const CopyBox = defineComponent({
  props: {
    value: { type: String, required: true },
    name: String,
  },
  setup(props) {
    const { copy, copied } = useClipboard({ source: props.value });
    return () =>
      <div class={styles.copyBox} onClick={() => copy()}>
        {props.name && <span>{props.name}</span>}
        <code>{props.value}</code>
        <Icon icon={copied.value ? successIcon : copyOutlined}/>
      </div>;
  },
});

const Qrcode = defineComponent({
  props: {
    value: { type: String, required: true },
  },
  setup(props) {
    return () =>
      <QrcodeInternal tag="svg" value={props.value} options={{
        color: {
          light: '#00000000',
          dark: '#303133',
        },
      }}/>;
  },
});
