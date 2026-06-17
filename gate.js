/* 간단 비밀번호 잠금 (클라이언트용) — 우연한 외부 접근 차단용
   각 페이지에서 아래 전역값을 먼저 지정한 뒤 이 스크립트를 불러온다.
     window.DASH_GATE_HASH  : 비밀번호의 SHA-256 해시(hex)
     window.DASH_GATE_KEY   : 통과 상태 저장 키(페이지마다 다르게)
     window.DASH_GATE_LABEL : 입력창에 보여줄 안내 문구
*/
(function () {
  var EXPECT = window.DASH_GATE_HASH || "";
  var KEY = window.DASH_GATE_KEY || "dash_auth_ok_v1";
  var LABEL = window.DASH_GATE_LABEL || "비밀번호를 입력하세요";

  // 해시 설정이 없으면 잠금 없이 통과
  if (!EXPECT) return;

  // 이미 이번 세션에서 통과했으면 통과
  if (sessionStorage.getItem(KEY) === "1") return;

  // 통과 전까지 화면 숨김
  var de = document.documentElement;
  de.style.visibility = "hidden";

  function toHex(buf) {
    return Array.prototype.map
      .call(new Uint8Array(buf), function (b) {
        return ("0" + b.toString(16)).slice(-2);
      })
      .join("");
  }

  function hash(s) {
    if (window.crypto && crypto.subtle && crypto.subtle.digest) {
      return crypto.subtle
        .digest("SHA-256", new TextEncoder().encode(s))
        .then(toHex);
    }
    return Promise.resolve("");
  }

  function blockScreen() {
    de.style.visibility = "";
    document.addEventListener("DOMContentLoaded", function () {
      document.body.innerHTML =
        '<div style="font-family:sans-serif;color:#888;text-align:center;margin-top:25vh">접근하려면 새로고침 후 비밀번호를 입력하세요.</div>';
    });
  }

  function ask() {
    var p = window.prompt(LABEL);
    if (p === null) {
      blockScreen();
      return;
    }
    hash(p).then(function (h) {
      if (h && h === EXPECT) {
        sessionStorage.setItem(KEY, "1");
        de.style.visibility = "";
      } else {
        window.alert("비밀번호가 틀렸습니다.");
        ask();
      }
    });
  }

  ask();
})();
