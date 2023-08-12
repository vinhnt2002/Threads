interface HeadingProps {
  title: string;
  description: string;
}

const Heading: React.FC<HeadingProps> = ({ title, description }) => {
  return (
    <div>
      <h2 className=" head-text">{title}</h2>
      <p className="text-sm text-muted-foreground text-light-2">
        {description}
      </p>
    </div>
  );
};

export default Heading;
