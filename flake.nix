{
  description = "Sol's blog";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      systems = [
        "x86_64-linux"      # Linux x86_64
        "aarch64-darwin"    # MacBook Apple Silicon (M1/M2/M3/M4)
      ];

      forAllSystems = f: nixpkgs.lib.genAttrs systems (system: f system);
    in
    {
      devShells = forAllSystems (system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        {
          default = pkgs.mkShell {
            nativeBuildInputs = with pkgs; [
              zola
            ];

            shellHook = ''
              echo " Fiat Nix! 欢迎来到 Blux's Website 开发环境"
              echo ""
              echo "常用命令："
              echo "  zola serve          # 启动本地开发服务器（推荐）"
              echo "  zola serve --open   # 启动并自动打开浏览器"
              echo "  zola build          # 构建静态站点到 public/ 目录"
              echo ""
              echo "当前系统: ${system}"
            '';
          };
        }
      );
    };
}