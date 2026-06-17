/* 간단 비밀번호 잠금 (클라이언트용) — 우연한 외부 접근 차단용 */
(function () {
  var KEY = "dash_auth_ok_v1";
  var EXPECT = "b7920fb8943cd3d39ee6e54f7b2994f416eddb0a6e161f5bed4f28322f4b570b";

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
    // 보안 컨텍스트가 아니면(예: 일부 file:// 환경) 평문 대체
    return Promise.resolve("PLAIN:" + s);
  }

  function ask() {
    var p = window.prompt("비밀번호를 입력하세요");
    if (p === null) {
      // 취소 시 빈 화면 유지
      de.style.visibility = "";
      document.addEventListener("DOMContentLoaded", function () {
        document.body.innerHTML =
          '<div style="font-family:sans-serif;color:#888;text-align:center;margin-top:25vh">접근하려면 새로고침 후 비밀번호를 입력하세요.</div>';
      });
      return;
    }
    hash(p).then(function (h) {
      if (h === EXPECT || h === "PLAIN:momsolve2026") {
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
