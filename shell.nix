{ pkgs ? import <nixpkgs> {} }:
  pkgs.mkShell {
    buildInputs = with pkgs; [
      nodePackages.pnpm
      nodejs-16_x
    ];
}
