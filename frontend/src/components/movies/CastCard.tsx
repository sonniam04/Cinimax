import Image from "next/image";
import { tmdbImageUrl } from "@/lib/utils";
import type { TMDBCastMember } from "@/types/tmdb";

interface CastCardProps {
  member: TMDBCastMember;
}

export default function CastCard({ member }: CastCardProps) {
  return (
    <div className="flex flex-col items-center gap-2 text-center w-24">
      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-surface-raised shrink-0">
        <Image
          src={tmdbImageUrl(member.profile_path, "w185")}
          alt={member.name}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>
      <div>
        <p className="text-xs font-medium line-clamp-2 leading-tight">{member.name}</p>
        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{member.character}</p>
      </div>
    </div>
  );
}
