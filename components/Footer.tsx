import { FooterLegalLinks } from "@/components/FooterLegalLinks";
import { withBasePath } from "@/lib/paths";


export function Footer() {
  return (

    <footer className="site-footer">
      <div className="footer-menu">
      <div className="container"> 
        <FooterLegalLinks />
      </div>
      </div>

      <div className="container footer-layout">


        <div className="footer-main">
          <address className="footer-info">
            <p>
              지붕뚫은친구들 <span>|</span> 대표: 김선재 <span>|</span> 사업자등록번호: 867-23-01167
            </p>
            <p>
              통신판매업 신고번호: 2024-제주대륜-30 <span>|</span> 주소: 제주특별자치도 서귀포시 서호남로 25, 3층(서호동)
            </p>
            <p>
              개인정보보호 책임자: 김선재 <span>|</span> 계좌: 기업은행 466-065315-01-013 김선재(지붕뚫은친구들)
            </p>
            <div className="footer-cert">
              <a href="https://www.inicis.com/" rel="noreferrer" target="_blank" aria-label="이니시스 결제시스템 확인">
                <img src={withBasePath("/assets/images/escrow.png")} alt="이니시스" width={43} height={43} />
              </a>
              <p>
                자사는 클릭하시면 이니시스 결제시스템의 유효성을 확인하실 수 있습니다. 관광협회 공제영업보증보험에
                가입되어 있습니다. 또한 자사는 통신판매중개자이며 통신판매의 당사자가 아닙니다. 따라서 상품·거래정보 및
                거래에 대하여 책임을 지지않습니다.
              </p>
            </div>
          </address>
          <div className="footer-top">
            <div className="footer-contact">
              <p>
                <strong>고객센터</strong>
                <a href="tel:070-8825-0227">070-8825-0227</a>
              </p>
              <p>
                <strong>비즈니스</strong>
                <a href="mailto:hello@eataround.co.kr">hello@eataround.co.kr</a>
              </p>
            </div>
          </div>

        </div>

        <div className="footer-bottom">

          <p>© 2023 지붕뚫은친구들 Co.(eat.around). All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
